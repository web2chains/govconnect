import React from "react";

const TimKami = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Zahir Hadi Athallah",
      username: "@kurokazeee",
      image: "https://i.ibb.co/3y3sTp3f/jahir.jpg",
    },
    {
      id: 2,
      name: "Jose Andhika Putra",
      username: "@Pufferfist",
      image: "https://i.ibb.co/TDMYjW4k/jose.jpg",
    },
    {
      id: 3,
      name: "Puji Sulaiman",
      username: "@Sulaimandvlpr",
      image: "https://i.ibb.co/B5y3vFhH/sulaiman.jpg",
    },
    {
      id: 4,
      name: "Muhamad Zaidan Sumardi",
      username: "@zaiidan06",
      image: "https://cdn.dorahacks.io/static/files/197f9e494ba4c3cafbf0ffa487ea8a70.jpg@256h.webp",
    },
    {
      id: 5,
      name: "Ibnu Hamid Aufa Fawwaz",
      username: "@IbnuHamid",
      image: "https://i.ibb.co/C5WJQq3V/Whats-App-Image-2024-11-08-at-12-30-22-576x1024.jpg",
    },
  ];

  const Card = ({ member }) => (
  <div className="bg-white border border-black rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
    {/* Member Image */}
    <div className="w-full aspect-[3/4] bg-brand-placeholder overflow-hidden">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover object-center"
      />
    </div>

    {/* Content */}
    <div className="p-6 text-center space-y-2">
      <h3 className="font-poppins font-bold text-xl lg:text-2xl text-black">
        {member.name}
      </h3>
      <p className="font-poppins font-semibold text-lg lg:text-xl text-black">
        {member.username}
      </p>
    </div>
  </div>
);


  return (
    <section className="bg-brand-bg py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-9">
        {/* Section Title */}
        <h2 className="font-poppins font-bold text-3xl lg:text-[35px] text-black text-center mb-12 lg:mb-16">
          Tim kami
        </h2>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {teamMembers.slice(0, 3).map((member) => (
            <Card key={member.id} member={member} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto mt-6 lg:mt-8">
          {teamMembers.slice(3, 5).map((member) => (
            <Card key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimKami;
