// Cosmopro site content. Edit here, then run: node tools/build.mjs
// Anything marked CONFIRM needs checking with the client before launch (see MEDIA.md).

export const site = {
  name: 'Cosmopro',
  legal: 'Cosmopro (Pvt) Ltd',
  url: 'https://cosmopro.net',
  phones: ['+92 324 8592259', '+92 333 5789878'],
  landline: '051 443 0850',
  emails: ['contact@cosmopro.net', 'cosmopropvtltd@gmail.com'],
  whatsapp: '923248592259', // CONFIRM which mobile number takes WhatsApp
  address: ['Plot 145, Street 9', 'Sector I-10/3', 'Islamabad, Pakistan'],
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Plot+145+Street+9+I-10%2F3+Islamabad',
  hours: 'Monday to Friday, 9:00 to 17:00 (PKT)', // CONFIRM (old site said GMT, a template leftover)
  formEndpoint: '', // CONFIRM: Formspree / Web3Forms URL. Empty = the form opens a pre-filled email instead.
  socials: [], // CONFIRM: old site had icons with no links. Add {label, url} pairs here.
};

export const nav = [
  { label: 'About', href: 'about.html' },
  { label: 'Services', href: 'services.html' },
  { label: 'Range', href: 'range.html' },
  { label: 'Contact', href: 'contact.html' },
];

export const home = {
  hero: {
    title: ['Your brand,', 'formulated.'],
    lead: 'Formulation, manufacturing, filling and packaging for skincare, haircare and personal care brands.',
    kicker: 'Private label · Contract · Toll manufacturing',
  },
  statement: {
    title: 'Our name is on the factory. Yours goes on the bottle.',
    body: 'Cosmopro is a cosmetics and personal care manufacturer in Islamabad. For more than twenty years we have developed, made and finished products for other people’s brands, from a first serum to a complete range.',
  },
  audiences: {
    title: 'For every stage of a brand.',
  },
  services: {
    title: 'Choose how much you bring.',
    lead: 'Three ways to work with us, one standard of manufacturing.',
  },
  range: {
    title: 'A formulation library, ready for your name.',
    lead: 'Every formula can be adjusted to your brief, then made, filled and packed under your brand.',
  },
  process: {
    title: 'From formula to finished product.',
    lead: 'One partner for every stage. Follow a single serum through our floor.',
  },
  quality: {
    title: 'Quality you can build a brand on.',
    body: [
      'Your product represents your brand, so it has to be right every time. Quality is built into how we manufacture, not checked at the end.',
      'Our quality management system is certified to ISO 9001:2015 and audited every year. Twenty years of production experience sit behind every batch we release.',
    ],
  },
};

export const stats = [
  { value: '20+', label: 'Years manufacturing' },
  { value: '{count}', label: 'Ready formulations' },
  { value: '25 kg', label: 'Smallest minimum order' },
  { value: 'ISO 9001', label: 'Certified since 2022' },
];

export const audiences = [
  {
    tag: 'Startups and new brands',
    q: 'Launching your first product?',
    body: 'Turn a product idea into finished cosmetics without building your own manufacturing setup. From your first product to your first collection.',
    img: 'assets/img/client-startups.jpg',
    service: 'private-label',
  },
  {
    tag: 'Established brands',
    q: 'Ready to expand your range?',
    body: 'Reliable capacity, new product development and quality-focused production, so you can grow without adding a factory.',
    img: 'assets/img/client-established.jpg',
    service: 'toll',
  },
  {
    tag: 'Retailers and businesses',
    q: 'Want a product line of your own?',
    body: 'Private label and contract manufacturing for retailers who want quality cosmetics and personal care under their own name.',
    img: 'assets/img/client-retail.jpg',
    service: 'contract',
  },
];

export const services = [
  {
    slug: 'private-label',
    name: 'Private label',
    tagline: 'Launch your own product, faster.',
    you: 'Your brand name and artwork.',
    we: 'A ready formulation from our library, adjusted to your requirements, then manufactured, filled, labelled and packed.',
    ideal: 'Startups, new brands and retailers launching a first range.',
    body: [
      'Choose from our range of ready-to-market formulations and create products under your own brand.',
      'We help you select suitable products, customise them to your requirements, and take them through manufacturing, filling, labelling and packaging.',
    ],
    img: 'assets/img/skin-creams.jpg',
  },
  {
    slug: 'contract',
    name: 'Contract manufacturing',
    tagline: 'Bring your product idea to life.',
    you: 'A concept, a brief or a reference product.',
    we: 'Development to your specification, then full production, from formula and packaging to finished stock.',
    ideal: 'Brands with a specific product in mind.',
    body: [
      'Have a specific product, formulation or concept in mind? We develop and manufacture it to your requirements and specifications.',
      'We work closely with you throughout, so the finished product meets your expectations for quality, formulation, packaging and production.',
    ],
    img: 'assets/img/factory-filling.jpg',
  },
  {
    slug: 'toll',
    name: 'Toll manufacturing',
    tagline: 'Your formula. Our manufacturing.',
    you: 'Your finalised formulation and specifications.',
    we: 'Our production floor, equipment and team, run with a focus on quality, consistency and efficient production.',
    ideal: 'Established brands that own their formulas.',
    body: [
      'Already have your own formulation and specifications? Toll manufacturing gives you access to our production capacity and expertise.',
      'You provide the formulation and requirements. Our team manages manufacturing with a focus on quality, consistency and efficiency.',
    ],
    img: 'assets/img/factory-machinery.jpg',
  },
];

export const capabilities = [
  'Product development, formulation and optimisation',
  'Bulk production',
  'Filling',
  'Labelling',
  'Printing of packaging material',
  'Packaging',
  'Sourcing packaging material on your behalf',
];

export const process = [
  { name: 'Formulation', long: 'Formulation and development', body: 'We develop a new formula or refine yours, based on your requirements.' },
  { name: 'Manufacturing', long: 'Product manufacturing', body: 'Your batch is produced on our floor using reliable, quality-focused processes.' },
  { name: 'Filling', long: 'Filling', body: 'Product is filled accurately and consistently into your bottles, tubes or jars.' },
  { name: 'Labelling', long: 'Labelling', body: 'Labels are applied to your artwork and specifications.' },
  { name: 'Packaging', long: 'Packaging', body: 'Cartons and outer packs complete the product and its presentation.' },
  { name: 'Finished', long: 'Finished product', body: 'Market-ready stock under your brand, prepared for your shelves.' },
];

export const why = [
  { title: '20+ years of experience', body: 'Decades of formulation and manufacturing knowledge.' },
  { title: 'Certified quality', body: 'An ISO 9001:2015 quality management system, audited every year.' },
  { title: 'Complete support', body: 'Formulation, production, filling, labelling and packaging under one roof.' },
  { title: 'Flexible solutions', body: 'Private label, contract or toll manufacturing, with orders from 25 kg.' },
  { title: 'One reliable partner', body: 'A single team from concept to finished product.' },
];

export const credentials = [
  {
    name: 'ISO 9001:2015',
    body: 'Quality management system for the manufacture and sale of cosmetic and toiletries products. Certified by DAS Certification, accredited by PNAC. Held since 2022.',
    img: 'assets/img/cert-iso-9001.jpg',
  },
  {
    name: 'Pakistan Standard Mark',
    body: 'Licensed by the Pakistan Standards and Quality Control Authority (PSQCA).',
    img: 'assets/img/cert-psqca.jpg',
  },
  {
    name: 'PCMA member',
    body: 'Member of the Pakistan Cosmetics Manufacturers Association.',
    img: 'assets/img/cert-pcma.jpg',
  },
];

// Category videos: drop Flow loops into assets/video with these names (see MEDIA.md).
// Until then the poster image is shown.
export const categories = [
  {
    slug: 'skincare',
    name: 'Skincare',
    blurb: 'Products for everyday skin needs, from cleansing and hydration to targeted treatment.',
    poster: 'assets/img/cat-skincare.jpg',
    video: 'assets/video/skincare',
    lines: [
      { name: 'Serums', moq: '25 kg', img: 'assets/img/skin-dropper.jpg', items: ['Brightening serum', 'Niacinamide serum', 'Vitamin C serum', 'Retinol serum', 'Hyaluronic acid serum', 'Pore minimising serum', 'Anti-ageing serum', 'Acne control serum', 'Peptide serum', 'Ceramide serum'] },
      { name: 'Anti-ageing creams', moq: '50 kg', img: 'assets/img/skin-jar.jpg', items: ['Ceramide barrier repair moisturiser', 'Encapsulated retinol cream', 'Anti-ageing cream'] },
      { name: 'Moisturisers and creams', moq: '100 kg', img: 'assets/img/skin-creams.jpg', items: ['Brightening cream', 'Barrier repair cream', 'Skin brightening moisturiser', 'Body lotion', 'Soft cream', 'Oil-based moisturising lotion', 'Water-based moisturising lotion', 'Hydrating lotion, paraffin oil free', 'Body butter'] },
      { name: 'Sun protection', moq: '50 kg', img: 'assets/img/skin-spf.jpg', items: ['SPF 30 sunscreen', 'SPF 50 hybrid sunscreen', 'SPF 50 hybrid UV milk', 'Mineral sunscreen', 'Tinted sunscreen'] },
      { name: 'Face cleansing', moq: '100 kg', img: 'assets/img/skin-tube.jpg', items: ['Sulphate-free face wash', 'Gentle cleanser', 'Hydrating cleanser', 'Brightening face wash', 'Acne control face wash', 'Exfoliating face wash', 'Makeup cleanser', 'Sugar scrub', 'Micellar cleansing gel'] },
    ],
  },
  {
    slug: 'haircare',
    name: 'Haircare',
    blurb: 'Products that cleanse, nourish, condition and style, for every hair type.',
    poster: 'assets/img/cat-haircare.jpg',
    video: 'assets/video/haircare',
    lines: [
      { name: 'Hair cleansing', moq: '100 kg', img: 'assets/img/hair-cleansing.jpg', items: ['Daily shampoo', 'Anti-dandruff shampoo', 'Herbal shampoo', 'Advanced conditioning shampoo', 'Sulphate-free shampoo', 'Anti-hair fall shampoo'] },
      { name: 'Hair treatment', moq: '100 kg', img: 'assets/img/hair-treatment.jpg', items: ['Hair conditioner', 'Leave-in conditioner', 'Hair mask', 'Keratin hair mask', 'Hair serum', 'Hair growth serum', 'Hair growth tonic', 'Argan oil hair serum', 'Hair oil'] },
      { name: 'Hair styling', moq: '100 kg', img: 'assets/img/hair-styling.jpg', items: ['Hair gel', 'Hair perfume mist', 'Hair wax', 'Hair styling cream'] },
    ],
  },
  {
    slug: 'hair-colour',
    name: 'Hair colour',
    blurb: 'Professional colour ranges and the care products around them, made to your brand requirements.',
    poster: 'assets/img/cat-hair-colour.jpg',
    video: 'assets/video/hair-colour',
    lines: [
      { name: 'Professional hair colour', moq: '300 kg', img: 'assets/img/hair-colour.jpg', items: ['Permanent hair colour', 'Ammonia-free hair colour', 'Professional salon hair colour'] },
      { name: 'Developers and colour care', moq: '300 kg', img: 'assets/img/hair-developers.jpg', items: ['Developer cream', 'Oxidant lotion', 'Colour protection shampoo', 'Colour protection conditioner'] },
    ],
  },
  {
    slug: 'toiletries-homecare',
    name: 'Toiletries and homecare',
    blurb: 'Everyday personal care and household ranges, with the same manufacturing standard.',
    poster: 'assets/img/cat-toiletries.jpg',
    video: 'assets/video/toiletries',
    lines: [
      { name: 'Hygiene and daily care', moq: '100 kg', img: 'assets/img/toiletries.jpg', items: ['Hand wash', 'Antibacterial hand wash', 'Liquid soap'] },
      { name: 'Men’s grooming', moq: '100 kg', img: 'assets/img/skin-moisturisers.jpg', items: ['Men’s face wash', 'Men’s moisturiser', 'Hair styling gel', 'Beard oil', 'Beard growth serum', 'Hair styling wax'] },
      { name: 'Kitchen care', moq: '100 kg', img: 'assets/img/factory-line.jpg', items: ['Dish wash liquid', 'Kitchen degreaser'] },
      { name: 'Surface care', moq: '100 kg', img: 'assets/img/factory-machinery.jpg', items: ['Surface cleaner', 'Multi-surface cleaner', 'Antibacterial surface cleaner', 'Glass cleaner', 'Bathroom cleaner', 'Floor cleaner', 'Disinfectant cleaner'] },
    ],
  },
];

export const about = {
  title: 'Twenty years, built around quality.',
  lead: 'Cosmopro (Pvt) Ltd is a cosmetics and personal care manufacturer based in Islamabad, Pakistan. For more than twenty years we have helped businesses develop and manufacture quality products for their brands.',
  body: [
    'Our expertise covers skincare, haircare, hair colour, toiletries and homecare, with flexible manufacturing designed around each client’s needs.',
    'We work with a strong focus on quality, consistency and reliability. As an ISO 9001:2015 certified manufacturer, we follow established quality standards throughout our processes.',
  ],
  goal: 'Our goal is simple: make cosmetics manufacturing easier, more reliable and more accessible for businesses of every size.',
};

export const enquire = {
  title: 'Start a project.',
  lead: 'Tell us what you want to make. The more you share, the more useful our first reply will be. We usually respond within two working days.', // CONFIRM response time
};
