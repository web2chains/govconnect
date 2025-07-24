import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Bool "mo:base/Bool";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Debug      "mo:base/Debug";
import Time "mo:base/Time";
import Error "mo:base/Error";
import { setTimer } = "mo:base/Timer";
import Int "mo:base/Int";
import Principal "mo:base/Principal";

actor main {
  type Candidate = {
    id: Nat;
    name: Text;
    electionId: Nat;
    votes: Nat;
    imageUrl : Text;
    partai : Text;
  };

  type Election = {
    id: Nat;
    title: Text;
    isOpen: Bool;
    category: Text;
    provinsi : Text;
    kota     : Text;
    endTime: ?Nat64;
  };

   type News = {
    id       : Nat;
    title    : Text;
    snippet  : Text;
    content  : Text;
    imageUrl : Text;
    created  : Nat64;
  };

  public type VoterProfile = {
    owner            : Principal;
    nik              : Text;
    fullName         : Text;
    address          : Text;
    desaKelurahan    : Text;
    rtRw             : Text;
    kecamatan        : Text;
    tempatLahir      : Text;
    provinsi         : Text;
    kota             : Text;
    tanggalLahir     : Text;
    agama            : Text;
    jenisKelamin     : Text;
    pekerjaan        : Text;
    statusPerkawinan : Text;
    berlakuHingga    : Text;
    kewarganegaraan  : Text;
  };

  public type RegionResults = {
    byCandidate     : [ (Text, Float) ];
    byProvinsi      : [ (Text, [Float]) ];
    byKota          : [ (Text, Text, [Float]) ];
    byKecamatan     : [ (Text, Text, Text, [Float]) ];
    byKelurahanDesa : [ (Text, Text, Text, Text, [Float]) ];
  };

  stable var elections: List.List<Election> = List.nil<Election>();
  stable var candidates: List.List<Candidate> = List.nil<Candidate>();
  stable var voterRegistry: List.List<(Principal, Nat)> = List.nil<(Principal, Nat)>();
  stable var adminRegistry: List.List<Principal> = List.nil<Principal>();
  stable var newsList : List.List<News> = List.nil<News>();
  stable var profiles : List.List<VoterProfile> = List.nil<VoterProfile>();
  stable var voteDetail : List.List<(Principal, Nat, Nat)> = List.nil<(Principal, Nat, Nat)>();

  private func findProfile(p: Principal): ?VoterProfile {
    List.find<VoterProfile>(profiles, func(pr) { pr.owner == p })
  };

   private func getCandidateIdFor(voter: Principal, electionId: Nat) : ?Nat {
  let foundEntry = List.find<(Principal, Nat, Nat)>(
    voteDetail,
    func(entry) {
      let (p, eId, _) = entry;
      (p == voter) and (eId == electionId)
    }
  );

  switch (foundEntry) {
    case null {
      null
    };
    case (?(_, _, cid)) {
      ?cid
    };
  };
};

func flatten<T>(arr: [[T]]): [T] {
  var result : [T] = [];
  for (subArr in arr.vals()) {
    result := Array.append(result, subArr);
  };
  result
};


private func findIndex<T>(arr: [T], pred: T -> Bool) : ?Nat {
  var i = 0;
  label l for (val in arr.vals()) {
    if (pred(val)) return ?i;
    i += 1;
  };
  null
};

  public query func getResultsByRegion(electionId: Nat) : async RegionResults {
  let cands = List.toArray(
    List.filter<Candidate>(candidates, func(c) { c.electionId == electionId })
  );
  let nC = Array.size(cands);

  var provTallies : [(Text, [Nat])]                          = [];
  var cityTallies : [(Text, Text, [Nat], Nat)]              = [];
  var kecamTallies : [(Text, Text, Text, [Nat], Nat)]       = [];
  var desaTallies : [(Text, Text, Text, Text, [Nat], Nat)]  = [];

  for ((voter, eid) in List.toArray(voterRegistry).vals()) {
    if (eid == electionId) {
      switch (findProfile(voter)) {
        case null {};
        case (?prof) {
          switch (getCandidateIdFor(voter, electionId)) {
            case null {};
            case (?cid) {
              switch (findIndex<Candidate>(cands, func(c) { c.id == cid })) {
                case null {};
                case (?i) {
                  var updated = false;
                  var newProvTallies : [(Text, [Nat])] = [];

                  for ((prov, vec) in provTallies.vals()) {
                    if (prov == prof.provinsi) {
                      let newVec = Array.tabulate<Nat>(nC, func(j) {
                        if (j == i) vec[j] + 1 else vec[j]
                      });
                      newProvTallies := Array.append(newProvTallies, [(prov, newVec)]);
                      updated := true;
                    } else {
                      newProvTallies := Array.append(newProvTallies, [(prov, vec)]);
                    };
                  };

                  if (not updated) {
                    let newVec = Array.tabulate<Nat>(nC, func(j) {
                      if (j == i) 1 else 0
                    });
                    newProvTallies := Array.append(newProvTallies, [(prof.provinsi, newVec)]);
                  };

                  provTallies := newProvTallies;
                  cityTallies  := updateCity(prof.provinsi, prof.kota, i, cityTallies, nC);
                  kecamTallies := updateKecam(prof.provinsi, prof.kota, prof.kecamatan, i, kecamTallies, nC);
                  desaTallies  := updateDesa(prof.provinsi, prof.kota, prof.kecamatan, prof.desaKelurahan, i, desaTallies, nC);
                };
              };
            };
          };
        };
      };
    };
  };

  let allVecs = Array.map<(Text, [Nat]), [Nat]>(provTallies, func((_, vec)) = vec);
  let flatVec = flatten<Nat>(allVecs);
  let totalProv = Array.foldLeft<Nat, Nat>(flatVec, 0, func(acc, x) { acc + x });


  let byCandidate = Array.tabulate<(Text, Float)>(nC, func(j) {
    let vecsJ = Array.map<(Text, [Nat]), Nat>(provTallies, func((_, vec)) = vec[j]);
    let count = Array.foldLeft<Nat, Nat>(vecsJ, 0, func(acc, x) { acc + x });


    let pct = if (totalProv == 0) 0.0
              else Float.fromInt(count) / Float.fromInt(totalProv) * 100.0;
    (cands[j].name, pct)
  });

  let byProvinsi      = mkProv(nC, provTallies);
  let byKota          = mkCity(cityTallies);
  let byKecamatan     = mkKecam(kecamTallies);
  let byKelurahanDesa = mkDesa(desaTallies);

  { byCandidate; byProvinsi; byKota; byKecamatan; byKelurahanDesa }
};

private func mkProv(
  nC  : Nat,
  data: [(Text, [Nat])]
) : [(Text, [Float])] {
  Array.map<(Text,[Nat]),(Text,[Float])>(
    data,
    func((region, vec)) {
      let total = Array.foldLeft<Nat, Nat>(vec, 0, func(acc, x) { acc + x });
      let fracs = Array.tabulate<Float>(nC, func(i) {
        if (total == 0) 0.0
        else Float.fromInt(vec[i]) / Float.fromInt(total) * 100.0
      });
      (region, fracs)
    }
  )
};

private func mkCity(
  arr: [(Text, Text, [Nat], Nat)]
) : [(Text, Text, [Float])] {
  Array.map<(Text,Text,[Nat],Nat),(Text,Text,[Float])>(
    arr,
    func((p, k, vec, tot)) {
      let total = Array.foldLeft<Nat, Nat>(vec, 0, func(acc, x) { acc + x });
      let fr = Array.tabulate<Float>(Array.size(vec), func(i) {
        if (total == 0) 0.0
        else Float.fromInt(vec[i]) / Float.fromInt(total) * 100.0
      });
      (p, k, fr)
    }
  )
};

private func mkKecam(
  arr: [(Text, Text, Text, [Nat], Nat)]
) : [(Text, Text, Text, [Float])] {
  Array.map<(Text,Text,Text,[Nat],Nat),(Text,Text,Text,[Float])>(
    arr,
    func((p, k, ke, vec, tot)) {
      let total = Array.foldLeft<Nat, Nat>(vec, 0, func(acc, x) { acc + x });
      let fr = Array.tabulate<Float>(Array.size(vec), func(i) {
        if (total == 0) 0.0
        else Float.fromInt(vec[i]) / Float.fromInt(total) * 100.0
      });
      (p, k, ke, fr)
    }
  )
};

private func mkDesa(
  arr: [(Text, Text, Text, Text, [Nat], Nat)]
) : [(Text, Text, Text, Text, [Float])] {
  Array.map<(Text,Text,Text,Text,[Nat],Nat),(Text,Text,Text,Text,[Float])>(
    arr,
    func((p, k, ke, ds, vec, tot)) {
      let total = Array.foldLeft<Nat, Nat>(vec, 0, func(acc, x) { acc + x });
      let fr = Array.tabulate<Float>(Array.size(vec), func(i) {
        if (total == 0) 0.0
        else Float.fromInt(vec[i]) / Float.fromInt(total) * 100.0
      });
      (p, k, ke, ds, fr)
    }
  )
};

private func updateCity(
  prov : Text, kota : Text, idx : Nat,
  old  : [(Text, Text, [Nat], Nat)],
  nC   : Nat
) : [(Text, Text, [Nat], Nat)] {
  var out  : [(Text, Text, [Nat], Nat)] = [];
  var done = false;

  for (e in old.vals()) {
    let (p, k, vec, tot) = e;
    if (p == prov and k == kota) {
      let newVec = Array.tabulate<Nat>(Array.size(vec), func(j) {
        if (j == idx) vec[j] + 1 else vec[j]
      });
      out := Array.append(out, [(p, k, newVec, tot + 1)]);
      done := true;
    } else {
      out := Array.append(out, [e]);
    };
  };

  if (not done) {
    let zeroes = Array.tabulate<Nat>(nC, func(_) { 0 });
    let newZeroes = Array.tabulate<Nat>(nC, func(j) {
      if (j == idx) 1 else 0
    });
    out := Array.append(out, [(prov, kota, newZeroes, 1)]);
  };
  out
};

private func updateKecam(
  prov : Text, kota : Text, ke : Text, idx : Nat,
  old  : [(Text,Text,Text,[Nat],Nat)],
  nC   : Nat
) : [(Text,Text,Text,[Nat],Nat)] {
  var out  : [(Text,Text,Text,[Nat],Nat)] = [];
  var done = false;

  for (e in old.vals()) {
  let (p, k, kc, vec_, tot) = e;
  if (p == prov and k == kota and kc == ke) {
    let vec = Array.tabulateVar<Nat>(Array.size(vec_), func(j) { vec_[j] });
    vec[idx] := vec[idx] + 1;
    out := Array.append(out, [(p, k, kc, Array.freeze(vec), tot + 1)]);
    done := true;
  } else {
    out := Array.append(out, [e]);
  };
};

  if (not done) {
    let zeroesVar = Array.init<Nat>(nC, 0);
    zeroesVar[idx] := zeroesVar[idx] + 1;
    out := Array.append(out, [(prov, kota, ke, Array.freeze(zeroesVar), 1)]);
  };

  out
};

private func updateDesa(
  prov : Text, kota : Text, ke : Text, ds  : Text, idx : Nat,
  old  : [(Text,Text,Text,Text,[Nat],Nat)],
  nC   : Nat
) : [(Text,Text,Text,Text,[Nat],Nat)] {
  var out  : [(Text,Text,Text,Text,[Nat],Nat)] = [];
  var done = false;
  for (e in old.vals()) {
    let (p, k, kc, d, vec_imm, tot) = e;

    if (p == prov and k == kota and kc == ke and d == ds) {
      let vec : [var Nat] = Array.thaw<Nat>(vec_imm);
      vec[idx] := vec[idx] + 1;
      out := Array.append(out, [(p, k, kc, d, Array.freeze(vec), tot + 1)]);
      done := true;
    } else {
      out := Array.append(out, [e]);
    };
  };
  if (not done) {
    let zeroes : [var Nat] = Array.init<Nat>(nC, 0);
    zeroes[idx] := zeroes[idx] + 1;
    out := Array.append(out, [(prov, kota, ke, ds, Array.freeze(zeroes), 1)]);
  };
  out
};

  func contains(xs: [Text], val: Text) : Bool {
    for (x in xs.vals()) {
      if (x == val) return true;
    };
    return false;
  };

 public func registerProfile(
    nik              : Text,
    fullName         : Text,
    address          : Text,
    desaKelurahan    : Text,
    rtRw             : Text,
    kecamatan        : Text,
    tempatLahir      : Text,
    provinsi         : Text,
    kota             : Text,
    tanggalLahir     : Text,
    agama            : Text,
    jenisKelamin     : Text,
    pekerjaan        : Text,
    statusPerkawinan : Text,
    berlakuHingga    : Text,
    kewarganegaraan  : Text
) : async Text {
  let caller = Principal.fromActor(main);

  profiles := List.filter<VoterProfile>(profiles, func(pr) { pr.owner != caller });

  let prof : VoterProfile = {
    owner            = caller;
    nik              = nik;
    fullName         = fullName;
    address          = address;
    desaKelurahan    = desaKelurahan;
    rtRw             = rtRw;
    kecamatan        = kecamatan;
    tempatLahir      = tempatLahir;
    provinsi         = provinsi;
    kota             = kota;
    tanggalLahir     = tanggalLahir;
    agama            = agama;
    jenisKelamin     = jenisKelamin;
    pekerjaan        = pekerjaan;
    statusPerkawinan = statusPerkawinan;
    berlakuHingga    = berlakuHingga;
    kewarganegaraan  = kewarganegaraan;
  };

  profiles := List.push(prof, profiles);
  return "Profile registered/updated successfully.";
};

  public query func getMyProfile() : async ?VoterProfile {
    let caller = Principal.fromActor(main);
    findProfile(caller)
  };

  public query func getProfileOf(p: Principal) : async ?VoterProfile {
    findProfile(p)
  };

 public func addNews(
    title: Text,
    snippet: Text,
    content: Text,
    imageUrl: Text
  ): async Text {
    let newId = List.size(newsList) + 1;
    let now   = Time.now() / 1_000_000_000;
    let item = {
      id       = newId;
      title    = title;
      snippet  = snippet;
      content  = content;
      imageUrl = imageUrl;
      created  = Nat64.fromIntWrap(now);
    };
    newsList := List.push(item, newsList);
    return "News added: " # title;
  };


  public func updateNews(
    id        : Nat,
    titleOpt  : ?Text,
    snippetOpt: ?Text,
    contentOpt: ?Text,
    imgOpt    : ?Text
  ) : async Text {
    var found = false;
    newsList := List.map<News, News>(newsList, func(n) {
      if (n.id == id) {
        found := true;
        {
          id       = n.id;
          title    = switch (titleOpt)   { case (?t) t; case null n.title };
          snippet  = switch (snippetOpt) { case (?s) s; case null n.snippet };
          content  = switch (contentOpt) { case (?c) c; case null n.content };
          imageUrl = switch (imgOpt)     { case (?u) u; case null n.imageUrl };
          created  = n.created;
        }
      } else {
        n
      }
    });
    if (found) "News updated." else "News not found."
  };

  public func deleteNews(id: Nat) : async Text {
    let init = List.size(newsList);
    newsList := List.filter<News>(newsList, func(n) { n.id != id });
    if (List.size(newsList) < init) "News deleted." else "News not found."
  };

  public query func getAllNews(): async [News] {
    let arr    = List.toArray(newsList);
    let sorted = Array.sort<News>(
      arr,
      func(a, b) {
        if (a.created > b.created) { #less }
        else if (a.created < b.created) { #greater }
        else { #equal }
      }
    );
    return sorted;
  };

  public func createAdmin(p: Principal): async Text {
    if (List.find<Principal>(adminRegistry, func(x: Principal): Bool { x == p }) != null) {
      return "Admin already exists.";
    };
    adminRegistry := List.push(p, adminRegistry);
    return "Admin added successfully.";
  };

  public func isAdmin(p: Principal): async Bool {
    switch (List.find<Principal>(adminRegistry, func(x: Principal): Bool { x == p })) {
      case (?_) true;
      case null false;
    }
  };

  public func CreateElection(title: Text, category: Text, provinsi: Text, kota : Text): async Text {
    let newId = List.size(elections) + 1;
    let newElection = {
      id = newId;
      title = title;
      category = category;
      provinsi = provinsi;
      kota = kota;
      isOpen = false;
      endTime = null;
    };
    elections := List.push(newElection, elections);
    return "Election '" # title # "' in category '" # category # "' created.";
  };

  public func updateElection(
    id       : Nat,
    titleOpt : ?Text,
    catOpt   : ?Text,
    provOpt  : ?Text,
    kotaOpt  : ?Text
  ) : async Text {
    var found = false;
    elections := List.map<Election, Election>(elections, func(e) {
      if (e.id == id) {
        found := true;
        {
          id       = e.id;
          title    = switch (titleOpt) { case (?t) t; case null e.title };
          category = switch (catOpt)   { case (?c) c; case null e.category };
          provinsi = switch (provOpt)  { case (?p) p; case null e.provinsi };
          kota     = switch (kotaOpt)  { case (?k) k; case null e.kota };
          isOpen   = e.isOpen;
          endTime  = e.endTime;
        }
      } else {
        e
      }
    });
    if (found) "Election updated." else "Election not found."
  };


  public func deleteElection(id: Nat) : async Text {
    let initialSize = List.size(elections);
    elections := List.filter<Election>(elections, func(e) { e.id != id });
    candidates := List.filter<Candidate>(candidates, func(c) { c.electionId != id });
    if (List.size(elections) < initialSize) {
      "Election deleted."
    } else {
      "Election not found."
    }
  };

  public func addCandidate(electionId: Nat, name: Text, imageUrl: Text, partai: Text): async Text {
    let electionOpt = List.find<Election>(elections, func(e: Election): Bool { e.id == electionId });
    switch (electionOpt) {
      case (?election) {
        let newCandidateId = List.size(candidates) + 1;
        let newCandidate = {
          id = newCandidateId;
          name = name;
          electionId = electionId;
          votes = 0;
          imageUrl = imageUrl;
          partai = partai;
        };
        candidates := List.push(newCandidate, candidates);
        return "Candidate " # name # " added successfully to election ID " # Nat.toText(electionId) # "!";
      };
      case null {
        return "Election with ID " # Nat.toText(electionId) # " not found.";
      };
    }
  };

  public func updateCandidate(
  id        : Nat,
  name      : ?Text,
  imageUrl  : ?Text,
  partai    : ?Text
) : async Text {
  var found = false;
  candidates := List.map<Candidate, Candidate>(candidates, func(c) {
    if (c.id == id) {
      found := true;
      {
        c
        with
          name     = switch (name)     { case (?n) n;      case null c.name     };
          imageUrl = switch (imageUrl) { case (?u) u;     case null c.imageUrl };
          partai = switch (partai) { case (?u) u;     case null c.partai };
      }
    } else {
      c
    }
  });
  if (found) "Candidate updated."
  else       "Candidate not found."
};

  public func deleteCandidate(id: Nat) : async Text {
    let init = List.size(candidates);
    candidates := List.filter<Candidate>(candidates, func(c) { c.id != id });
    if (List.size(candidates) < init) "Candidate deleted." else "Candidate not found."
  };

  public func getElections(): async [Election] {
    return List.toArray(elections);
  };

  public func getCandidates(electionId: Nat): async [Candidate] {
    return List.toArray(
      List.filter<Candidate>(candidates, func(c: Candidate): Bool {
        c.electionId == electionId;
      })
    );
  };

  public func openVote(electionId: Nat, durationInSeconds: Nat): async Text {
  let now = Time.now() / 1_000_000_000;
  let end = Nat64.fromIntWrap(now + durationInSeconds);

  elections := List.map<Election, Election>(elections, func(e: Election): Election {
    if (e.id == electionId and not e.isOpen) {
      { e with isOpen = true; endTime = ?end };
    } else {
      e
    }
  });

  ignore setTimer<system>(
    #seconds durationInSeconds,
    func() : async () {
      ignore await closeExpiredElections();
    }
  );

  return "Election " # Nat.toText(electionId) # " has started and will end in " # Nat.toText(durationInSeconds) # " seconds!";
  };


     public func castVote(electionId: Nat, candidateId: Nat): async Text {
    let caller = Principal.fromActor(main);

    switch (findProfile(caller)) {
      case (null) {
        return "Anda belum membuat profil. Silakan registerProfile terlebih dahulu.";
      };
      case (?prof) {
        switch (List.find<Election>(elections, func(e) { e.id == electionId })) {
          case (null) {
            return "Election dengan ID " # Nat.toText(electionId) # " tidak ditemukan.";
          };
          case (?e) {
            if (e.provinsi != "" and prof.provinsi != e.provinsi) {
              return "Anda tidak berhak memilih di provinsi " # e.provinsi # ".";
            };
            if (e.kota     != "" and prof.kota     != e.kota) {
              return "Anda tidak berhak memilih di kota " # e.kota # ".";
            };
            if (not e.isOpen) {
              return "Voting untuk election ini belum dibuka atau sudah ditutup.";
            };
            let already = List.find<(Principal, Nat)>(voterRegistry, func(entry) {
              entry.0 == caller and entry.1 == electionId
            }) != null;
            if (already) {
              return "Anda sudah memberikan suara di election ini.";
            };
            switch (List.find<Candidate>(candidates, func(c) {
              c.id == candidateId and c.electionId == electionId
            })) {
              case (null) {
                return "Kandidat ID " # Nat.toText(candidateId) # " tidak ditemukan di election ini.";
              };
              case (?cand) {
                candidates := List.map<Candidate, Candidate>(candidates, func(c) {
                  if (c.id == candidateId) { { c with votes = c.votes + 1 } }
                  else                      { c }
                });
                voterRegistry := List.push((caller, electionId), voterRegistry);
                voteDetail    := List.push((caller, electionId, candidateId), voteDetail);
                return "Suara berhasil untuk '" # cand.name # "'.";
              };
            };
          };
        };
      };
    };
  };


  public func getElectionResults(electionId: Nat): async [(Text, Nat, Float)] {
    let electionOpt = List.find<Election>(elections, func(e: Election): Bool {
      e.id == electionId
    });

    switch (electionOpt) {
      case (?election) {
        let filteredCandidates = List.filter<Candidate>(candidates, func(c: Candidate): Bool {
          c.electionId == election.id
        });

        let totalVoters = List.size(
          List.filter<(Principal, Nat)>(voterRegistry, func(entry: (Principal, Nat)): Bool {
            entry.1 == election.id
          })
        );

        let results = List.map<Candidate, (Text, Nat, Float)>(filteredCandidates, func(c: Candidate): (Text, Nat, Float) {
          let percent : Float = if (totalVoters == 0) 0 else Float.fromInt(c.votes) / Float.fromInt(totalVoters) * 100;
          (c.name, c.votes, percent)
        });

        return List.toArray(results);
      };
      case null {
        return [];
      };
    }
  };

  public query func getCandidateCountPerCategory(): async [(Text, Nat)] {
    var result: [(Text, Nat)] = [];
    var seenCategories: [Text] = [];

    for (election in List.toArray(elections).vals()) {
      if (not contains(seenCategories, election.category)) {
        let count = List.size(
          List.filter<Candidate>(candidates, func(c: Candidate): Bool {
            c.electionId == election.id
          })
        );
        result := Array.append(result, [(election.category, count)]);
        seenCategories := Array.append(seenCategories, [election.category]);
      };
    };
    return result;
  };

  public query func getVoterCountPerCategory(): async [(Text, Nat)] {
    var result: [(Text, Nat)] = [];
    var seenCategories: [Text] = [];

    for (election in List.toArray(elections).vals()) {
      if (not contains(seenCategories, election.category)) {
        let count = List.size(
          List.filter<(Principal, Nat)>(voterRegistry, func(entry: (Principal, Nat)): Bool {
            entry.1 == election.id
          })
        );
        result := Array.append(result, [(election.category, count)]);
        seenCategories := Array.append(seenCategories, [election.category]);
      };
    };
    return result;
  };

  public func closeExpiredElections() : async Text {
    let now = Nat64.fromIntWrap(Time.now() / 1_000_000_000);

    var countClosed = 0;

    elections := List.map<Election, Election>(elections, func(e: Election): Election {
      switch (e.endTime) {
        case (?end) {
          if (e.isOpen and now >= end) {
            countClosed += 1;
            { e with isOpen = false; endTime = null }
          } else {
            e
          }
        };
        case null {
          e
        }
      }
    });

    if (countClosed == 0) {
      "No expired elections to close."
    } else {
      Nat.toText(countClosed) # " expired election(s) closed."
    }
  };
}