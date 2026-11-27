/* Azad Properties — listing data.
   Sources: brief §12 project catalog (real named developments), Drive folder
   "Azad Properties Portfolio" (Buildings + Shops & Offices folder names),
   demo listings (prices/sqm/beds/baths from the live azadproperties.com scrape).
   Prices are USD. price:null = "Price on request" — never invented.
   NO company metrics (years/clients/citizenships counts) anywhere by client order. */
const WA_NUM = "905531633074";          // WhatsApp for bot + leads (Shaan, 27 Nov 2026)
const PHONE = "+90 212 296 33 31";
const EMAIL = "sales1@azadproperties.com";

const RATES = { USD:{rate:1, sym:"$"}, EUR:{rate:0.92, sym:"€"}, GBP:{rate:0.79, sym:"£"}, TRY:{rate:41.2, sym:"₺"} };
const RATE_NOTE = "Indicative conversion — final price confirmed on enquiry.";

function fmtPrice(usd, cur){
  if (usd == null) return null;
  const r = RATES[cur] || RATES.USD;
  const v = usd * r.rate;
  return r.sym + Math.round(v).toLocaleString("en-US");
}

/* type: Apartment | Villa | Building | Hotel | Land | Commercial | Office
   cbi: price qualifies for Citizenship by Investment ($400k+)
   res: price qualifies for Investor Residence Permit ($200k+) */
/* LISTINGS now live in assets/data/listings.json (single source of truth).
   The public site fetches it in main.js; the Azad team edits it via admin.html.
   This file keeps constants, team, FAQs, steps and testimonials. */

const FEATURED = ["APH-34101","APH-34107","APH-34105","APH-34111","APH-34120","APH-34129","APH-34401","APH-34402","APH-34408","APH-34411","APH-34417","APH-34421"];

/* ---- Team (brief §6) ---- */
const TEAM = [
{n:"Shaan Agha", r:"Chief Executive Officer (CEO)", d:"Strategic leadership, developer relations, foreign direct investment oversight.", photo:"assets/img/team/team-05-man-sunglasses.jpg", wa:true},
{n:"Syed Asad Abbas", r:"COO & Managing Partner", d:"Operations management, transaction structuring, legal oversight.", wa:true},
{n:"Mishal Agha", r:"Head of Marketing", d:"Global brand positioning, digital campaigns, international media strategy.", photo:"assets/img/team/team-02-woman-blonde.jpg", wa:false},
{n:"Mariam Mirza", r:"Sales Director", d:"Oversight of portfolio acquisitions and international sales teams.", photo:"assets/img/team/team-06-woman-blonde-2.jpg", wa:true},
{n:"Nuri İçil", r:"Sales Manager", d:"Developer inventory alignment and local Turkish market strategy.", photo:"assets/img/team/team-01-man-grey-blazer.jpg", wa:true},
{n:"Fahri Dursun", r:"Senior Property Consultant", d:"Prime Istanbul investments, luxury villas, commercial portfolios.", photo:"assets/img/team/team-07-man-brown-blazer.jpg", wa:true},
{n:"Mehreen Raza", r:"Property Consultant", d:"Residential sales, CBI portfolio advisory, South Asian buyer desk.", wa:true},
{n:"Amir Ilyas", r:"Property Consultant", d:"Investment analysis, secondary market listings, client onboarding.", wa:true},
{n:"Advocate Selçuk Yıldız", r:"Legal Counsel / Senior Lawyer", d:"Land registry due diligence, Tapu transfers, foreign title verification.", photo:"assets/img/team/team-10-man-blue-suit.jpg", wa:false},
{n:"Suleiman", r:"Legal Counsel / Citizenship Specialist", d:"CBI file submission, civil registration, passport application processing.", wa:false},
{n:"Nasima Abdul Majeed", r:"Client & Operations Coordinator", d:"Client concierge, viewing schedules, post-sale administration.", photo:"assets/img/team/team-03-woman-hijab.jpg", wa:false},
{n:"Enes Opan", r:"Operations & Coordination", d:"Field management, document verification, authority liaisons.", wa:false},
{n:"Mutlu Barış Şen", r:"Finance & Accounts Supervisor", d:"Financial compliance, escrow accounts, tax payments.", photo:"assets/img/team/team-09-man-bald-beard.jpg", wa:false},
{n:"Mustafa Sayan", r:"Finance & Accounts Manager", d:"Currency conversions, transaction reconciliation, bank transfers.", photo:"assets/img/team/team-08-man-black-jacket.jpg", wa:false},
];

/* ---- Ecosystem (brief §9) ---- */
const ECOSYSTEM = [
{n:"Azad Properties", d:"www.azadproperties.com", c:"#0F0F0F", s:"Luxury real estate brokerage, primary developer partnerships (Nef, Sinpaş, Avrupa Konutları, Emaar), secondary market resales, and end-to-end Turkish Citizenship by Investment advisory."},
{n:"Azad Builders", d:"Construction arm", c:"#D4AF37", s:"Ground-up residential developments, heritage building restorations in historic Istanbul (Beyoğlu, Galata, Balat), structural retrofitting, and high-end residential interior fit-outs."},
{n:"Azad Homes", d:"www.azadhomes.com", c:"#800080", s:"Property management division operating hundreds of properties, including luxury short-term rental units across Beyoğlu, Şişli, Beşiktaş, Eyüp, and Fatih. Integrated with Airbnb, Booking.com, and Expedia, supported by a multilingual guest relations team."},
{n:"Azad Ventures", d:"www.azadventures.com.tr", c:"#0A1A3A", s:"Corporate venture capital, foreign direct investment structuring, business incorporation, tax & IP advisory, bilateral trade between Pakistan and Turkey, joint ventures, and family relocation support."},
{n:"Azad Tours & Events", d:"www.azadtours.com", c:"#00B7E8", s:"TÜRSAB & IATA certified Destination Management Company operating in Istanbul, Cappadocia, and Antalya. Corporate MICE, VIP airport transfers, luxury yacht charters, and private travel itineraries."},
{n:"Azat Films", d:"www.azatfilms.com", c:"#AA1E2E", s:"Media production studio in Istanbul specializing in TV commercials, documentary features, real estate video tours, and corporate media. Production partner for Turkish Airlines and the Turkish Ministry of Culture & Tourism."},
{n:"Azad Textiles", d:"www.azadtextiles.com", c:"#01411C", s:"Global textile sourcing, commercial manufacturing, institutional apparel supply, and international export operations connecting Turkish textile mills with global retail buyers."},
{n:"Azad Medicare", d:"Medical Tourism Division", c:"#008080", s:"Medical tourism division of the Azad Brothers group, connecting international patients with trusted healthcare providers in Türkiye."},
];

/* ---- FAQs (brief §8) ---- */
const FAQS = [
{q:"What is the minimum investment for Turkish citizenship?", a:"A qualifying real estate investment of at least $400,000. The property carries a three-year holding commitment, and the average processing time is 4 to 8 months from complete file submission."},
{q:"Can I combine multiple properties to reach the $400,000 threshold?", a:"Yes. You can purchase multiple properties across different locations in Turkey, provided the total appraised value meets or exceeds $400,000 USD and all applications are processed together."},
{q:"Is my family included in the citizenship application?", a:"Yes. Your spouse and all legal biological or legally adopted children under 18 years of age are included in the same application at no additional investment cost."},
{q:"Can I rent out my property during the 3-year holding period?", a:"Yes. You retain full rental rights and can earn rental yield in foreign currency or TRY throughout the mandatory 3-year holding period."},
{q:"Does Turkey allow dual citizenship?", a:"Yes. Turkish law fully recognizes dual and multiple citizenship. However, applicants must check if their home country permits dual citizenship."},
{q:"Am I required to take a new Turkish name upon citizenship?", a:"No. You can retain your original name and surname. Alternatively, you may adopt a Turkish name if you prefer."},
{q:"Do foreign buyers own property on a freehold basis in Turkey?", a:"Yes. All real estate acquisitions by foreigners in Turkey are 100% freehold ownership (Mülkiyet)."},
{q:"What are the ongoing annual property holding taxes in Turkey?", a:"Annual real estate tax (Emlak Vergisi) ranges from 0.1% to 0.2% for residential properties (0.2% to 0.4% in metropolitan areas like Istanbul) based on the municipality's assessed value."},
{q:"Are there capital gains taxes when selling a property in Turkey?", a:"If an individual holds a property for 5 full years before selling, the capital gains income tax is 100% exempt. If sold within 5 years, standard progressive tax rates apply to net profit."},
{q:"What are the legal rules for short-term / Airbnb rentals in Turkey?", a:"Under current regulations, short-term residential rentals (under 100 days) require an official short-term rental license from the Ministry of Culture and Tourism, approval from 100% of building co-owners, and installation of compliant safety systems. Azad Homes manages this compliance process end-to-end for property owners."},
{q:"What does Rental Guaranteed mean?", a:"Selected properties that come with guaranteed rental income. Rental Guaranteed listings start from $117,000."},
{q:"How do I start?", a:"Call or WhatsApp us on +90 553 163 3074, or email sales1@azadproperties.com. Tell us your budget and what you are looking for, and we will send matching properties with a private consultation."},
];

const CBI_STEPS = [
{phase:"Phase 1 — First Visit", meta:"3–4 working days in Istanbul", steps:[
{t:"Step 1 (Days 1–2): Property Selection & Reservation", d:"Conduct property viewings with Azad Properties consultants. Select eligible CBI properties ($400k+ total value) and sign a formal reservation agreement backed by a security deposit to lock pricing."},
{t:"Step 2 (Day 3): Legal Power of Attorney & Banking Setup", d:"Visit a Turkish Public Notary accompanied by a sworn translator. Execute a limited Legal Power of Attorney (POA) granting Azad Properties' legal counsel authority to handle land registry transactions, tax filings, and citizenship procedures on your behalf. Obtain a Turkish Tax Identification Number and open a personal account at a top Turkish bank (e.g., Ziraat Bank, İş Bankası, Garanti BBVA)."}]},
{phase:"Phase 2 — Remote Execution", meta:"Client operating remotely, about 30 days", steps:[
{t:"Step 3: Transfer Investment Funds", d:"Transfer investment capital from your home or international bank account into your newly opened Turkish bank account via international wire transfer in USD or EUR."},
{t:"Step 4: Official Valuation Report (SPK Appraisal)", d:"Azad Properties' legal team appoints a valuation expert licensed by the Capital Markets Board (CMB / SPK) to inspect the property and issue an official appraisal confirming its market value meets or exceeds the required threshold."},
{t:"Step 5: Foreign Currency Exchange Certificate (DAB)", d:"In compliance with Central Bank regulations, the buyer's Turkish bank converts the USD/EUR funds into Turkish Lira (TRY) and issues an official Foreign Exchange Purchase Certificate (Döviz Alım Belgesi — DAB)."},
{t:"Step 6: Land Registry Application & Tax Notice", d:"The local Land Registry Office (Tapu Dairesi) reviews all transaction files, verifies the DAB certificate, and issues the official 4% Title Deed Transfer Tax payment notice."},
{t:"Step 7: Final Settlement & Title Deed (Tapu) Transfer", d:"Final property payments are released to the seller. Authorized legal counsel signs the land registry books under POA, issuing the official Title Deed (Tapu) containing the mandatory 3-year non-sale annotation (3 Yıl Satılamaz Şerhi)."}]},
{phase:"Phase 3 — Citizenship File Preparation", meta:"About 45 days", steps:[
{t:"Step 8: Certificate of Conformity (Uygunluk Belgesi)", d:"Legal counsel submits the Tapu, valuation report, bank transfer receipts, and DAB certificate to the Ministry of Environment, Urbanization and Climate Change to obtain the official Certificate of Conformity."},
{t:"Step 9: Document Attestation & Civil Verification", d:"The client submits personal civil documents for all applicants (main applicant, spouse, children under 18): official birth certificates; marriage, divorce, or single status certificate; family registration document (Nüfus Kayıt Örneği); police clearance certificate (issued within the last 6 months); spouse Power of Attorney & photo identification. All foreign documents must be apostilled in the home country or attested by the Ministry of Foreign Affairs (MOFA) and legalised by the Turkish Consulate, then translated into Turkish by a sworn translator and notarized in Turkey."}]},
{phase:"Phase 4 — Biometrics, Approval & Passport Issuance", meta:"Biometrics & final issuance", steps:[
{t:"Step 10 (Second Visit): Investor Residence Permit Application", d:"The main applicant and family visit Turkey for 2 working days to submit fingerprints and biometrics at the Provincial Directorate of Migration Management (Göç İdaresi), obtaining an Investor Short-Term Residence Permit (99-series ID)."},
{t:"Step 11 (Third Visit): Final Citizenship Application Biometrics", d:"Submit biometric data and formal citizenship application files at the specialized Foreign Investors Citizenship Desk."},
{t:"Step 12: Government Security Background Review", d:"The file undergoes multi-agency review by the Ministry of Interior, Security General Directorate (Emniyet), and National Intelligence Organization (MİT). This process takes approximately 6 to 10 months."},
{t:"Step 13: Presidential Approval & Certificate Issuance", d:"Upon successful background clearance, the citizenship dossier is transmitted to the President of the Republic of Turkey for final signature and issuance of the official Citizenship Decision Document."},
{t:"Step 14: Collection of Turkish National ID & Passports", d:"Applicants collect their official Turkish Identity Cards and Passports by providing final biometrics at a local civil registry office (Nüfus Müdürlüğü) in Turkey or at the nearest Turkish Embassy/Consulate in their country of residence."}]},
];

/* Real client reviews — Google Maps (Azad Brothers, Şişli Istanbul: 4.9★, 60 reviews)
   + azadproperties.com testimonials. No invented reviews. */
const GOOGLE_RATING = "4.9";
const GOOGLE_REVIEW_COUNT = 60;
const TESTIMONIALS = [
{n:"Gunduz Mammadzada", s:5, src:"Google", t:"Working with azad brothers was always been a pleasure. Everybody is friendly and always trying to help and their service is fast. I can recommend them to everybody who want to live in Turkey, especially Istanbul. Special thanks to Yusuf and Yasin for the quickness."},
{n:"Wazila Zahra", s:5, src:"Google", t:"I'm extremely satisfied with the services provided by Azad Brothers. Their home management team has been exceptional, ensuring everything is well taken care of. I highly recommend their services to anyone looking for reliable and professional home management solutions. They have made my life so much easier, and I am truly grateful for their support."},
{n:"Babar N.Sheikh", s:5, src:"Google", t:"I've been working with Azad Brothers for almost 4 years or more, and I can say that I have felt super supported and comfortable with them. Their team is very cooperative and professional, and they truly care about their clients. Shariq, Wazir, Yasin and Yusuf and the entire team is very helpful and friendly, and whenever I need anything, they are always ready to help. Highly recommended to anyone looking for reliable and trustworthy services."},
{n:"Faizan Ahmad", s:5, src:"Google", t:"I want to say thank you to Azad Brothers for the great help and support. And I want to give a special thanks to Wazir for always being available to help me. He always helped me whenever I need him, especially about my resident permit and rent issues. I definitely recommend Azad Brothers and Wazir to others for help."},
{n:"Hamid Kakar", s:5, src:"Google", t:"I have been living in Turkey for 7 years now. Azad brothers helped me throughout in my business matters, rent, residence etc. In one word, they're the best. They've a highly professional team and are a great bunch of people."},
{n:"Farhan Iqbal", s:5, src:"Google", t:"I had a great experience with Azad Brothers, and Yasin was outstanding. My residence permit application had been rejected, but he guided me through the process and helped me resolve the issue. I'm truly grateful for his support. Highly recommended."},
{n:"Yakup Akpınar", s:5, src:"Google", t:"I rented an apartment through Azad Brothers. Mr. Yusuf, in particular, was incredibly helpful during the rental process. He was always there for us, even after we moved into the house, and helped us with every matter. I am very grateful to him and the Azad Brothers family."},
{n:"Erim Sönmez", s:5, src:"Google", t:"I applied for a residence permit in Istanbul in May, everything was smooth and I got my residence permit within 2 months. During the process they took care of everything from filling out my application to the appointment. I got my appointments and documents easily. I also received my deposit back and I know that if I had applied by myself, I would have a lot of difficulties. I will definitely apply again next year and I highly recommend them to all foreigners living in Istanbul."},
{n:"Mohammad Ali Usman, Canada", s:5, src:"azadproperties.com", t:"We had the privilege to work with Azad Properties based in Istanbul when we applied for our Turkish citizenship. We have found them to be an extremely professional unit. The entire process of buying the properties and the applying process was handled with utmost care. The follow up post receipt of our documents has also been diligently done and all accounts properly submitted. Mr. Shaan Agha (also the partner/owner) leads a very dedicated team."},
{n:"Imran Javed, Pakistan", s:5, src:"azadproperties.com", t:"From the moment I landed in İstanbul to the end of my stay there, I never got the feeling of being alone in a foreign land. Got excellent advice for making the right investment and all the necessary paperwork was handled in the most professional way. I thank you all at Azad properties for your support and help in buying the property and also for taking care of all other matters such as hotel bookings, airport pick and drop, etc."},
{n:"Sergey Leonidov", s:5, src:"azadproperties.com", t:"Была цель купить квартиру для получения гражданства. Обратился в компанию Azad Properties, и получил тот сервис который я хотел и даже лучше. Быстро и оперативно все оформили."},
{n:"Yulia Gavrilova", s:5, src:"azadproperties.com", t:"Выражаю огромную благодарность компании Азад за такую выгодную сделку. Теперь я обладатель квартиры в центре Стамбула, спасибо!!"}
];
