import { Topic, Counselor, TimetableEntry, Appointment, LineSettings, SchoolInfo } from '../types';

export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  schoolName: 'โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี',
  centerName: 'ศูนย์พิทักษ์สิทธิ เสรีภาพ และความปลอดภัย "ศูนย์พิงใจ"',
  shortName: 'ศูนย์พิงใจ บ.ด.น.',
  slogan: 'เพราะทุกเรื่องที่อยากคุย มีคนพร้อมรับฟัง',
  location: 'ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2 โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี',
  customLogoType: 'vector',
  logoShape: 'circle',
  logoFit: 'contain',
  logoPadding: 'small',
  emergencyHotlines: [
    { name: 'สายด่วนสุขภาพจิต (Mental Health Hotline)', number: '1323', description: 'โทรฟรีตลอด 24 ชั่วโมง ให้คำปรึกษาปัญหาความเครียด' },
    { name: 'ศูนย์ช่วยเหลือสังคม พม.', number: '1300', description: 'สายด่วนช่วยเหลือเด็ก สตรี และผู้ถูกกระทำความรุนแรง' },
    { name: 'สมาคมสะมาริตันส์แห่งประเทศไทย', number: '02-113-6789', description: 'รับฟังด้วยใจ เพื่อป้องกันการทำร้ายตัวเอง (12.00 - 22.00 น.)' },
    { name: 'ห้องพยาบาล / แนะแนว บ.ด.น.', number: '02-588-3444', description: 'ติดต่อครูแนะแนวและห้องพยาบาลในเวลาทำการโรงเรียน' }
  ]
};

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'mental_health',
    numericId: 1,
    title: 'สุขภาพจิตและความเครียด',
    shortDescription: 'ความเครียด อารมณ์ ความกังวล การเห็นคุณค่าในตนเอง',
    scopeDescription: 'ความเครียด ความวิตกกังวล การจัดการอารมณ์ การปรับตัว การเห็นคุณค่าในตนเอง และปัญหาด้านจิตใจ',
    iconName: 'HeartHandshake',
    color: '#0D9488', // Teal-600
    bgColor: '#F0FDFA', // Teal-50
    borderColor: '#99F6E4', // Teal-200
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'studies_future',
    numericId: 2,
    title: 'การเรียนและอนาคต',
    shortDescription: 'ปัญหาการเรียน วางแผนการศึกษา ค้นหาความถนัด อาชีพ',
    scopeDescription: 'ปัญหาการเรียน การวางแผนการเรียน การค้นหาความถนัด การศึกษาต่อ การประกอบอาชีพ และการวางแผนอนาคต',
    iconName: 'GraduationCap',
    color: '#2563EB', // Blue-600
    bgColor: '#EFF6FF', // Blue-50
    borderColor: '#BFDBFE', // Blue-200
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'love_sex_ed',
    numericId: 3,
    title: 'ความรักและเพศศึกษา',
    shortDescription: 'ความสัมพันธ์ ความรัก การวางขอบเขต สิทธิ เพศศึกษา',
    scopeDescription: 'ความสัมพันธ์ ความรัก การวางขอบเขต การเคารพสิทธิของตนเองและผู้อื่น ความรู้ด้านเพศศึกษา และการป้องกันความเสี่ยง',
    iconName: 'Heart',
    color: '#E11D48', // Rose-600
    bgColor: '#FFF1F2', // Rose-50
    borderColor: '#FECDD3', // Rose-200
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'friends_social',
    numericId: 4,
    title: 'เพื่อนและสังคมรอบตัว',
    shortDescription: 'ปัญหาเพื่อน การถูกกลั่นแกล้ง ความขัดแย้ง การเข้าสังคม',
    scopeDescription: 'ปัญหาเพื่อน การถูกกลั่นแกล้ง การถูกกีดกัน ความขัดแย้ง การปรับตัวเข้ากับสังคม และการอยู่ร่วมกับผู้อื่น',
    iconName: 'Users',
    color: '#7C3AED', // Violet-600
    bgColor: '#F5F3FF', // Violet-50
    borderColor: '#DDD6FE', // Violet-200
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
  }
];

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  {
    id: 'tt-mon',
    day: 'จันทร์',
    juniorTopicId: 'mental_health',
    juniorTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    seniorTopicId: 'friends_social',
    seniorTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    notes: 'เปิดรับคำปรึกษาทั้งแบบพบตัวจริงและออนไลน์'
  },
  {
    id: 'tt-tue',
    day: 'อังคาร',
    juniorTopicId: 'love_sex_ed',
    juniorTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    seniorTopicId: 'studies_future',
    seniorTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    notes: 'เปิดรับคำปรึกษาทั้งแบบพบตัวจริงและออนไลน์'
  },
  {
    id: 'tt-wed',
    day: 'พุธ',
    juniorTopicId: 'friends_social',
    juniorTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    seniorTopicId: 'mental_health',
    seniorTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    notes: 'เปิดรับคำปรึกษาทั้งแบบพบตัวจริงและออนไลน์'
  },
  {
    id: 'tt-thu',
    day: 'พฤหัสบดี',
    juniorTopicId: 'studies_future',
    juniorTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    seniorTopicId: 'love_sex_ed',
    seniorTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    notes: 'เปิดรับคำปรึกษาทั้งแบบพบตัวจริงและออนไลน์'
  },
  {
    id: 'tt-fri',
    day: 'ศุกร์',
    juniorTopicId: 'mental_health',
    juniorTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    seniorTopicId: 'friends_social',
    seniorTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    notes: 'เปิดรับคำปรึกษาทั้งแบบพบตัวจริงและออนไลน์'
  }
];

// Helper to generate gentle illustrated/avatar portraits with distinct look
const getTeacherAvatar = (gender: 'male' | 'female', id: number, name: string) => {
  // Using Unsplash high quality professional Asian portrait photos for realistic school counselors
  const femaleAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
  ];
  const maleAvatars = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  ];

  const pool = gender === 'female' ? femaleAvatars : maleAvatars;
  return pool[id % pool.length];
};

export const INITIAL_COUNSELORS: Counselor[] = [
  // 1. สุขภาพจิตและความเครียด (9 ท่าน)
  {
    id: 'c-mh-1',
    name: 'นายบุญญฤทธิ์ ญาณสาลี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา / งานแนะแนว',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('male', 0, 'นายบุญญฤทธิ์ ญาณสาลี'),
    bio: 'เชี่ยวชาญการจัดการความเครียด รับฟังอย่างเข้าใจ และเทคนิคการผ่อนคลายจิตใจ',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1001',
    lineId: '@counselor_boon',
    isActive: true
  },
  {
    id: 'c-mh-2',
    name: 'นางสาวปิยนุช ก้อนแก้ว',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย / งานแนะแนว',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 1, 'นางสาวปิยนุช ก้อนแก้ว'),
    bio: 'ยินดีรับฟังทุกปัญหาความกังวลใจ เสริมสร้างพลังบวก และการเห็นคุณค่าในตนเอง (Self-esteem)',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1002',
    lineId: '@counselor_piyanuch',
    isActive: true
  },
  {
    id: 'c-mh-3',
    name: 'นางณัฐวดี พงษ์สุขเวชกุล',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 2, 'นางณัฐวดี พงษ์สุขเวชกุล'),
    bio: 'พร้อมให้คำแนะนำด้านการปรับตัวในรั้วโรงเรียน การจัดการอารมณ์ และความวิตกกังวล',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1003',
    lineId: '@counselor_natthawadee',
    isActive: true
  },
  {
    id: 'c-mh-4',
    name: 'นางสาวสุนิศา จันทร์น้อย',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 3, 'นางสาวสุนิศา จันทร์น้อย'),
    bio: 'พื้นที่ปลอดภัยสำหรับทุกความรู้สึก มาคุยกันเพื่อหาทางออกอย่างสบายใจ',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1004',
    lineId: '@counselor_sunisa',
    isActive: true
  },
  {
    id: 'c-mh-5',
    name: 'นายวงศ์วริศ นวมะมะลิธนาศิริ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('male', 1, 'นายวงศ์วริศ นวมะมะลิธนาศิริ'),
    bio: 'รับฟังด้วยใจ ไม่ตัดสิน พร้อมเป็นกำลังใจในวันที่รู้สึกเหนื่อยล้า',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1005',
    lineId: '@counselor_wongwaris',
    isActive: true
  },
  {
    id: 'c-mh-6',
    name: 'นางสาวสุกัญญา อาจหาญ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 4, 'นางสาวสุกัญญา อาจหาญ'),
    bio: 'พร้อมพูดคุยเรื่องความกังวลใจ ความเครียดจากการใช้ชีวิต และการดูแลจิตใจ',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1006',
    lineId: '@counselor_sukanya',
    isActive: true
  },
  {
    id: 'c-mh-7',
    name: 'นางสาวปาจรีย์ สุภากรจิต',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 5, 'นางสาวปาจรีย์ สุภากรจิต'),
    bio: 'ใช้ศิลปะบำบัดและการรับฟังอย่างลึกซึ้งในการดูแลสภาวะอารมณ์',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1007',
    lineId: '@counselor_pajaree',
    isActive: true
  },
  {
    id: 'c-mh-8',
    name: 'นางสาวอรอุมา ชูศรี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้การงานอาชีพ',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 6, 'นางสาวอรอุมา ชูศรี'),
    bio: 'ให้คำปรึกษาด้วยความเป็นกันเอง ช่วยคลายปมปัญหาในใจ',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1008',
    lineId: '@counselor_onuma',
    isActive: true
  },
  {
    id: 'c-mh-9',
    name: 'นางสาวกชกร แตงสมุทร',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'งานกิจกรรมพัฒนาผู้เรียน / งานแนะแนว',
    topicIds: ['mental_health'],
    imageUrl: getTeacherAvatar('female', 7, 'นางสาวกชกร แตงสมุทร'),
    bio: 'พร้อมเป็นที่พึ่งทางใจ ดูแลสุขภาพจิตอย่างใกล้ชิดและปลอดภัย',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-1009',
    lineId: '@counselor_kodchakorn',
    isActive: true
  },

  // 2. การเรียนและอนาคต (9 ท่าน)
  {
    id: 'c-sf-1',
    name: 'รองวันฉัตร จันทรสุข',
    roleTitle: 'รองผู้อำนวยการโรงเรียน',
    department: 'กลุ่มบริหารวิชาการ',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 8, 'รองวันฉัตร จันทรสุข'),
    bio: 'ให้คำปรึกษาด้านการวางแผนการเรียน การศึกษาต่อระดับอุดมศึกษา และเส้นทางอาชีพ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2001',
    lineId: '@counselor_wanchat',
    isActive: true
  },
  {
    id: 'c-sf-2',
    name: 'นางสาวพัชรา เจตบุตร',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 9, 'นางสาวพัชรา เจตบุตร'),
    bio: 'แนะแนวการเรียนสายวิทย์-คณิต การเตรียมตัวสอบ TCAS และการค้นหาความถนัด',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2002',
    lineId: '@counselor_patchara',
    isActive: true
  },
  {
    id: 'c-sf-3',
    name: 'นายจิรเดช ศรีวิไล',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('male', 2, 'นายจิรเดช ศรีวิไล'),
    bio: 'ช่วยวางแผนตารางอ่านหนังสือ การพัฒนาทักษะการเรียน และพิชิตเป้าหมายการสอบ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2003',
    lineId: '@counselor_jiradet',
    isActive: true
  },
  {
    id: 'c-sf-4',
    name: 'นางสาววรรธินี สาธุรัมย์',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 0, 'นางสาววรรธินี สาธุรัมย์'),
    bio: 'แนะแนวทุนการศึกษา การเรียนต่อต่างประเทศ และการเตรียมตัวด้านภาษา',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2004',
    lineId: '@counselor_wanthinee',
    isActive: true
  },
  {
    id: 'c-sf-5',
    name: 'นางสาวอุไรรัตน์ มาสกุล',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 1, 'นางสาวอุไรรัตน์ มาสกุล'),
    bio: 'ค้นหาความถนัดสายศิลป์-ภาษา ศิลป์-คำนวณ และการวางแผนพอร์ตโฟลิโอ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2005',
    lineId: '@counselor_urairat',
    isActive: true
  },
  {
    id: 'c-sf-6',
    name: 'นางสาวญาตยาณี ทองคำ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 2, 'นางสาวญาตยาณี ทองคำ'),
    bio: 'ให้คำแนะนำเรื่องคณะสายสังคมศาสตร์ นิติศาสตร์ รัฐศาสตร์ และอาชีพในอนาคต',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2006',
    lineId: '@counselor_yatayanee',
    isActive: true
  },
  {
    id: 'c-sf-7',
    name: 'นางสาววิมลรัตน์ มีพร',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 3, 'นางสาววิมลรัตน์ มีพร'),
    bio: 'แนะแนวสายศิลปะ ออกแบบ สถาปัตยกรรม มีเดีย และผลงานสร้างสรรค์',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2007',
    lineId: '@counselor_wimonrat',
    isActive: true
  },
  {
    id: 'c-sf-8',
    name: 'นางสาววราภรณ์ แสนพาน',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้การงานอาชีพ',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 4, 'นางสาววราภรณ์ แสนพาน'),
    bio: 'ให้คำปรึกษาด้านสายอาชีพ ทักษะเฉพาะทาง และการต่อยอดในยุคใหม่',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2008',
    lineId: '@counselor_waraporn',
    isActive: true
  },
  {
    id: 'c-sf-9',
    name: 'นางสาววิลาวัณย์ อินทราช',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'งานแนะแนว',
    topicIds: ['studies_future'],
    imageUrl: getTeacherAvatar('female', 5, 'นางสาววิลาวัณย์ อินทราช'),
    bio: 'ผู้เชี่ยวชาญด้านแบบทดสอบวัดแววความถนัด และระบบ TCAS ทุกรอบ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-2009',
    lineId: '@counselor_wilawan',
    isActive: true
  },

  // 3. ความรักและเพศศึกษา (9 ท่าน)
  {
    id: 'c-ls-1',
    name: 'นายศุภเชฐ สิงหพงศ์',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('male', 3, 'นายศุภเชฐ สิงหพงศ์'),
    bio: 'ให้คำปรึกษาเรื่องเพศศึกษา ความรักเชิงบวก และการปฏิบัติตนอย่างปลอดภัย',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3001',
    lineId: '@counselor_suphachet',
    isActive: true
  },
  {
    id: 'c-ls-2',
    name: 'นางสาวศรุตยา โสคำภา',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 6, 'นางสาวศรุตยา โสคำภา'),
    bio: 'พื้นที่พูดคุยเรื่องความสัมพันธ์ในวัยเรียน การตั้งขอบเขต และการเคารพตนเอง',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3002',
    lineId: '@counselor_sarutaya',
    isActive: true
  },
  {
    id: 'c-ls-3',
    name: 'นายนภสินธุ์ ตลับเพ็ชร์',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('male', 4, 'นายนภสินธุ์ ตลับเพ็ชร์'),
    bio: 'ให้ความรู้เรื่องสรีรวิทยา การป้องกันความเสี่ยง และความสัมพันธ์ที่ดีต่อใจ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3003',
    lineId: '@counselor_nopasin',
    isActive: true
  },
  {
    id: 'c-ls-4',
    name: 'นายสุรเชษฐ์ วัฒนาพร',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('male', 5, 'นายสุรเชษฐ์ วัฒนาพร'),
    bio: 'เปิดใจรับฟังทุกมุมมองความรัก ความหลากหลายทางเพศ (LGBTQ+) และสิทธิมนุษยชน',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3004',
    lineId: '@counselor_surachet',
    isActive: true
  },
  {
    id: 'c-ls-5',
    name: 'นางสาวพรภิรมย์ ไกรวิเศษ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 7, 'นางสาวพรภิรมย์ ไกรวิเศษ'),
    bio: 'รับฟังปัญหาอกหัก ความสับสนในความสัมพันธ์ และการรักตัวเอง (Self-love)',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3005',
    lineId: '@counselor_pornphirom',
    isActive: true
  },
  {
    id: 'c-ls-6',
    name: 'นางสาวณัฏฐณิชา รัตนภักดี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 8, 'นางสาวณัฏฐณิชา รัตนภักดี'),
    bio: 'พร้อมเป็นที่ปรึกษาเรื่องการสื่อสารในความสัมพันธ์ และการวางตัวที่เหมาะสม',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3006',
    lineId: '@counselor_natthanicha',
    isActive: true
  },
  {
    id: 'c-ls-7',
    name: 'นางสาวกมลชนก ศิริมงคล',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ศิลปะ',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 9, 'นางสาวกมลชนก ศิริมงคล'),
    bio: 'คุยได้ทุกเรื่องด้วยความเข้าใจ ไม่ตัดสิน ปลอดภัยและเป็นความลับ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3007',
    lineId: '@counselor_kamonchanok',
    isActive: true
  },
  {
    id: 'c-ls-8',
    name: 'นางฉวีวรรณ ก้อนคำ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้การงานอาชีพ',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 0, 'นางฉวีวรรณ ก้อนคำ'),
    bio: 'ให้คำปรึกษาเรื่องความสัมพันธ์ในครอบครัวและความรักอย่างอบอุ่น',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3008',
    lineId: '@counselor_chaweewan',
    isActive: true
  },
  {
    id: 'c-ls-9',
    name: 'นางสาวศกลรัตน์ แสนศักดิ์ศรี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'งานแนะแนว',
    topicIds: ['love_sex_ed'],
    imageUrl: getTeacherAvatar('female', 1, 'นางสาวศกลรัตน์ แสนศักดิ์ศรี'),
    bio: 'เชี่ยวชาญการให้คำปรึกษาเรื่องเพศวิถีศึกษาและความเท่าเทียมทางเพศ',
    availableDays: ['อังคาร', 'พฤหัสบดี'],
    phone: '081-xxx-3009',
    lineId: '@counselor_sakolrat',
    isActive: true
  },

  // 4. เพื่อนและสังคมรอบตัว (9 ท่าน)
  {
    id: 'c-fs-1',
    name: 'ผอ.สายไหม ดาบทอง',
    roleTitle: 'ผู้อำนวยการโรงเรียน',
    department: 'ฝ่ายบริหารโรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 2, 'ผอ.สายไหม ดาบทอง'),
    bio: 'มุ่งมั่นสร้างโรงเรียนเป็นพื้นที่ปลอดภัย ปราศจากการกลั่นแกล้ง (Anti-Bullying) และส่งเสริมความอบอุ่น',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4001',
    lineId: '@director_saimai',
    isActive: true
  },
  {
    id: 'c-fs-2',
    name: 'รองวัชรพงษ์ อักษรดี',
    roleTitle: 'รองผู้อำนวยการโรงเรียน',
    department: 'กลุ่มบริหารกิจการนักเรียน',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('male', 0, 'รองวัชรพงษ์ อักษรดี'),
    bio: 'ดูแลความปลอดภัย ช่วยไกล่เกลี่ยข้อขัดแย้ง และเสริมสร้างสัมพันธภาพอันดีในโรงเรียน',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4002',
    lineId: '@counselor_watcharapong',
    isActive: true
  },
  {
    id: 'c-fs-3',
    name: 'นางสาวอุบลพิชญ์ พูลสวัสดิ์',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 3, 'นางสาวอุบลพิชญ์ พูลสวัสดิ์'),
    bio: 'รับฟังปัญหาเรื่องเพื่อน การถูกกีดกันจากกลุ่ม และการสร้างความมั่นใจในการเข้าสังคม',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4003',
    lineId: '@counselor_ubonpitch',
    isActive: true
  },
  {
    id: 'c-fs-4',
    name: 'นางสาวมารุณี ทองอันตัง',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 4, 'นางสาวมารุณี ทองอันตัง'),
    bio: 'ช่วยแก้ปัญหาความไม่เข้าใจกันระหว่างเพื่อน และเทคนิคการปฏิเสธอย่างสุภาพ',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4004',
    lineId: '@counselor_marunee',
    isActive: true
  },
  {
    id: 'c-fs-5',
    name: 'นางสาวกรรณิการ์ สาระชิต',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 5, 'นางสาวกรรณิการ์ สาระชิต'),
    bio: 'รับมือปัญหา Cyberbullying และการใช้โซเชียลมีเดียอย่างปลอดภัย',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4005',
    lineId: '@counselor_kannika',
    isActive: true
  },
  {
    id: 'c-fs-6',
    name: 'นางสาวกัลยานี จำปี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 6, 'นางสาวกัลยานี จำปี'),
    bio: 'ส่งเสริมการอยู่ร่วมกันท่ามกลางความแตกต่าง และการสร้างมิตรภาพที่ยั่งยืน',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4006',
    lineId: '@counselor_kalyanee',
    isActive: true
  },
  {
    id: 'c-fs-7',
    name: 'นางหทัยชนก ศรีลาศักดิ์',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 7, 'นางหทัยชนก ศรีลาศักดิ์'),
    bio: 'ให้คำปรึกษาการปรับตัวสำหรับนักเรียนย้ายเข้าใหม่ หรือความรู้สึกโดดเดี่ยว',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4007',
    lineId: '@counselor_hathaichanok',
    isActive: true
  },
  {
    id: 'c-fs-8',
    name: 'นางสาวสุพรรณา อินทะรังษี',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้ศิลปะ / กิจกรรมพัฒนาผู้เรียน',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('female', 8, 'นางสาวสุพรรณา อินทะรังษี'),
    bio: 'ส่งเสริมกิจกรรมสานสัมพันธ์ และสร้างบรรยากาศห้องเรียนที่มีความสุข',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4008',
    lineId: '@counselor_supanna',
    isActive: true
  },
  {
    id: 'c-fs-9',
    name: 'นายนพพล สุวรรณะ',
    roleTitle: 'ครูผู้ให้คำปรึกษา',
    department: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา',
    topicIds: ['friends_social'],
    imageUrl: getTeacherAvatar('male', 1, 'นายนพพล สุวรรณะ'),
    bio: 'พร้อมรับฟังเรื่องความขัดแย้งกลุ่มเพื่อน และร่วมหาทางออกอย่างสันติวิธี',
    availableDays: ['จันทร์', 'พุธ', 'ศุกร์'],
    phone: '081-xxx-4009',
    lineId: '@counselor_nopphon',
    isActive: true
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-demo-1',
    trackingCode: 'BDN-2608-8821',
    createdAt: '2026-08-25T14:30:00Z',
    studentName: 'นายนรวิชญ์ สิทธิโชค',
    studentNickname: 'วิน',
    isAnonymous: false,
    studentGrade: 'ม.5',
    studentRoom: 'ม.5/2',
    studentIdNumber: '45892',
    contactPhone: '089-123-4567',
    contactLineId: 'win_norawich',
    topicId: 'studies_future',
    counselorId: 'c-sf-1',
    counselorName: 'รองวันฉัตร จันทรสุข',
    gradeLevel: 'm_senior',
    appointmentDate: '2026-08-27',
    appointmentDay: 'พฤหัสบดี',
    appointmentTimeSlot: '12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)',
    meetingFormat: 'in_person',
    briefIssueDescription: 'ต้องการปรึกษาการเตรียมสอบเข้าคณะแพทยศาสตร์และวางแผนพอร์ตโฟลิโอ TCAS รอบ 1',
    status: 'confirmed',
    statusNotes: 'ยินดีต้อนรับครับ พบกันที่ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2',
    confirmedAt: '2026-08-25T16:00:00Z',
    lineNotificationSent: true,
    lineNotificationHistory: [
      { timestamp: '2026-08-25T14:30:10Z', type: 'BOOKING_RECEIVED', message: 'ยื่นคำขอการนัดหมายรหัส BDN-2608-8821 สำเร็จ' },
      { timestamp: '2026-08-25T16:00:00Z', type: 'STATUS_UPDATED', message: 'ครูผู้ให้คำปรึกษายืนยันการนัดหมายแล้ว สถานที่: ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2' }
    ]
  },
  {
    id: 'apt-demo-2',
    trackingCode: 'BDN-2608-4190',
    createdAt: '2026-08-26T08:15:00Z',
    studentName: 'นักเรียนไม่ประสงค์ออกนาม (สมมุติ: น้องดาว)',
    studentNickname: 'ดาว',
    isAnonymous: true,
    studentGrade: 'ม.3',
    studentRoom: 'ม.3/5',
    contactPhone: '095-987-6543',
    contactLineId: 'star_anon_bdn',
    topicId: 'mental_health',
    counselorId: 'c-mh-2',
    counselorName: 'นางสาวปิยนุช ก้อนแก้ว',
    gradeLevel: 'm_junior',
    appointmentDate: '2026-08-28',
    appointmentDay: 'ศุกร์',
    appointmentTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    meetingFormat: 'in_person',
    briefIssueDescription: 'รู้สึกเครียดและนอนไม่หลับมาหลายสัปดาห์ กังวลเรื่องการสอบปลายภาค',
    status: 'pending',
    lineNotificationSent: true,
    lineNotificationHistory: [
      { timestamp: '2026-08-26T08:15:05Z', type: 'BOOKING_RECEIVED', message: 'ได้รับคำขอรับคำปรึกษารหัส BDN-2608-4190 อยู่ระหว่างรอการยืนยัน' }
    ]
  },
  {
    id: 'apt-demo-3',
    trackingCode: 'BDN-2608-1156',
    createdAt: '2026-08-24T10:00:00Z',
    studentName: 'นางสาวพิชญา กิตติคุณ',
    studentNickname: 'ใบเฟิร์น',
    isAnonymous: false,
    studentGrade: 'ม.2',
    studentRoom: 'ม.2/1',
    studentIdNumber: '47901',
    contactPhone: '082-345-6789',
    topicId: 'friends_social',
    counselorId: 'c-fs-1',
    counselorName: 'ผอ.สายไหม ดาบทอง',
    gradeLevel: 'm_junior',
    appointmentDate: '2026-08-24',
    appointmentDay: 'จันทร์',
    appointmentTimeSlot: '11.10 – 12.00 น. (ช่วงพัก ม.ต้น)',
    meetingFormat: 'in_person',
    briefIssueDescription: 'มีปัญหากับเพื่อนในกลุ่ม ไม่เข้าใจกันและรู้สึกถูกตัดออกจากกลุ่ม',
    status: 'completed',
    statusNotes: 'การพูดคุยเสร็จสิ้น นักเรียนมีรอยยิ้มและเข้าใจวิธีการปรับความเข้าใจกับเพื่อน',
    confirmedAt: '2026-08-24T10:30:00Z',
    completedAt: '2026-08-24T12:00:00Z',
    caseSummary: {
      id: 'case-demo-1',
      appointmentId: 'apt-demo-3',
      counselorId: 'c-fs-1',
      counselorName: 'ผอ.สายไหม ดาบทอง',
      dateRecorded: '2026-08-24T12:05:00Z',
      keyIssues: 'ความเข้าใจผิดจากการสื่อสารในแชทกลุ่ม ทำให้เกิดการแบ่งกลุ่มย่อย นักเรียนรู้สึกโดดเดี่ยว',
      sessionSummary: 'ได้รับฟังความรู้สึกของนักเรียน ให้ข้อแนะนำเรื่องการเปิดใจพูดคุยตัวต่อตัวอย่างนุ่มนวล พร้อมแนวทางฝึกมองมุมมองของเพื่อน',
      actionPlan: 'นัดติดตามผลสัปดาห์หน้า และให้คำแนะนำกับหัวหน้าห้องในการจัดกิจกรรมกลุ่มร่วมกัน',
      followUpNeeded: true,
      followUpDate: '2026-09-01',
      urgencyLevel: 'normal',
      mentalHealthScore: 8,
      isLocked: true,
      lastEditedBy: 'ผอ.สายไหม ดาบทอง'
    },
    lineNotificationSent: true
  }
];

export const INITIAL_LINE_SETTINGS: LineSettings = {
  webhookUrl: 'https://notify-api.line.me/api/notify',
  lineNotifyToken: 'BDN_PINGJAI_SECURE_TOKEN_2026',
  enableStudentAlert: true,
  enableTeacherAlert: true,
  autoSendOnBooking: true,
  autoSendOnStatusChange: true
};
