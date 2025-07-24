import React from "react";

const Hero = () => {
  return (
    <section className="bg-brand-bg py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-9">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Image banner */}
          <div className="order-2 lg:order-1">
            <img
              src="https://i.ibb.co/zTPnLgQS/Chat-GPT-Image-Jul-21-2025-04-29-11-PM.png"
              alt="Hero banner"
              className="w-full h-64 sm:h-80 lg:h-[417px] object-cover rounded-2xl"
            />
          </div>

          {/* Right side - Content */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Main Heading */}
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-[35px] leading-tight text-black">
              Mempermudah Indonesia menuju demokrasi yang modern dan maju mengikuti globalisasi
            </h1>

            {/* Description */}
            <p className="font-poppins font-normal text-base sm:text-lg lg:text-xl leading-relaxed text-black">
              GovConnect adalah sebuah platform digital yang dirancang untuk meningkatkan partisipasi publik dalam proses demokrasi secara transparan, mudah, dan aman. Aplikasi ini menjadi jembatan antara pemerintah dan masyarakat, memungkinkan warga negara untuk menyuarakan pendapat, memberikan masukan terhadap kebijakan, serta berpartisipasi dalam pengambilan keputusan secara langsung melalui sistem daring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
