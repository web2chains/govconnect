import React from "react";

const CallToAction = () => {
  return (
    <section className="bg-edem-gray-light py-24 px-4"> {/* Tambah py */}
      <div className="container mx-auto">
        <div className="bg-edem-purple rounded-[15px] px-8 py-16 lg:px-20 lg:py-20 max-w-[1279px] mx-auto relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-14">
            
            {/* Text Content */}
            <div className="lg:max-w-[761px]">
              <h2 className="text-white font-poppins text-3xl md:text-4xl lg:text-[43px] font-semibold leading-relaxed mb-8">
                Sudah Siap Menjadi Bagian Dari Masa Depan Pemilu Indonesia?
              </h2>
              <p className="text-white font-poppins text-lg md:text-xl font-normal leading-[1.8] mb-4">
                Mari jadi bagian dari sejarah baru demokrasi Indonesia yang aman, transparan, dan digital.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-col lg:items-end">
              <button className="border border-edem-gray-secondary hover:bg-edem-gray-secondary/10 transition-colors duration-200 rounded-[15px] px-6 py-4 h-[74px] w-full sm:w-[198px] flex items-center justify-center">
                <span className="text-white font-poppins text-xl font-medium">
                  Learn More
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
