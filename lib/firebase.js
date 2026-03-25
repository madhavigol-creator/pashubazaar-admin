import { db } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const seedInitialData = async () => {
  const admobDoc = await getDoc(doc(db, 'config', 'admob'));
  if (admobDoc.exists()) return;

  await setDoc(doc(db, 'config', 'admob'), {
    android: {
      appId: "ca-app-pub-5745598129174375~7891698032",
      units: [
        { id: "ao1", type: "App Open", unitId: "", enabled: true, priority: "high", screens: ["app_launch"] },
        { id: "in1", type: "Interstitial", unitId: "", enabled: true, priority: "high", screens: ["screen_change"] },
        { id: "rw1", type: "Rewarded", unitId: "", enabled: true, priority: "medium", screens: ["listing_detail", "post_ad"] },
        { id: "ri1", type: "Rewarded Interstitial", unitId: "", enabled: true, priority: "medium", screens: ["post_success", "chat_unlock"] },
        { id: "bn1", type: "Banner", unitId: "", enabled: true, priority: "low", screens: ["home", "search", "chat", "profile"] },
        { id: "na1", type: "Native", unitId: "", enabled: true, priority: "medium", screens: ["home_feed", "search_results", "chat_list"] },
      ]
    },
    ios: {
      appId: "ca-app-pub-5745598129174375~4571266678",
      units: [
        { id: "ao2", type: "App Open", unitId: "", enabled: true, priority: "high", screens: ["app_launch"] },
        { id: "in2", type: "Interstitial", unitId: "", enabled: true, priority: "high", screens: ["screen_change"] },
        { id: "rw2", type: "Rewarded", unitId: "", enabled: true, priority: "medium", screens: ["listing_detail", "post_ad"] },
        { id: "ri2", type: "Rewarded Interstitial", unitId: "", enabled: false, priority: "medium", screens: ["post_success"] },
        { id: "bn2", type: "Banner", unitId: "", enabled: true, priority: "low", screens: ["home", "search", "chat", "profile"] },
        { id: "na2", type: "Native", unitId: "", enabled: true, priority: "medium", screens: ["home_feed", "search_results"] },
      ]
    },
    updatedAt: serverTimestamp()
  });

  await setDoc(doc(db, 'config', 'ad_settings'), {
    interstitialFrequency: 1, interstitialCooldownSec: 30, rewardedCooldownSec: 60,
    appOpenCooldownSec: 30, maxAdsPerSession: 20, maxInterstitialPerHour: 10,
    bannerRefreshSec: 45, skipFirstInterstitial: true, showAdsToNewUsers: false,
    newUserGracePeriodHours: 24, childDirectedTreatment: false, testMode: false,
    mediationEnabled: true, consentRequired: true, updatedAt: serverTimestamp()
  });

  const placements = [
    { id: "p1", name: "App Launch", screen: "app_launch", adType: "App Open", enabled: true, frequency: "Every launch", description: "Shows when user opens the app" },
    { id: "p2", name: "Tab Navigation", screen: "screen_change", adType: "Interstitial", enabled: true, frequency: "Every tab switch", description: "Interstitial on every screen change" },
    { id: "p3", name: "Listing Detail", screen: "listing_detail", adType: "Interstitial", enabled: true, frequency: "Every view", description: "When user opens any listing" },
    { id: "p4", name: "Home Top Banner", screen: "home", adType: "Banner", enabled: true, frequency: "Always visible", description: "320x50 banner on home top" },
    { id: "p5", name: "Home Bottom Banner", screen: "home", adType: "Banner", enabled: true, frequency: "Always visible", description: "320x50 banner on home bottom" },
    { id: "p6", name: "Search Banner", screen: "search", adType: "Banner", enabled: true, frequency: "Always visible", description: "Banner in search" },
    { id: "p7", name: "Chat Banner", screen: "chat", adType: "Banner", enabled: true, frequency: "Always visible", description: "Banner in chat" },
    { id: "p8", name: "Home Feed Native", screen: "home_feed", adType: "Native", enabled: true, frequency: "Every 4 listings", description: "Native ad in feed" },
    { id: "p9", name: "Search Native", screen: "search_results", adType: "Native", enabled: true, frequency: "Every 3 results", description: "Native ad in search" },
    { id: "p10", name: "Free Boost Rewarded", screen: "listing_detail", adType: "Rewarded", enabled: true, frequency: "On demand", description: "Watch ad to boost listing" },
    { id: "p11", name: "Post Ad Rewarded", screen: "post_ad", adType: "Rewarded", enabled: true, frequency: "On demand", description: "Watch ad for free premium post" },
    { id: "p12", name: "Profile Banner", screen: "profile", adType: "Banner", enabled: true, frequency: "Always visible", description: "Banner on profile" },
    { id: "p13", name: "Chat Unlock", screen: "chat_unlock", adType: "Rewarded Interstitial", enabled: false, frequency: "On demand", description: "Watch ad to unlock chat" },
  ];
  for (const p of placements) {
    await setDoc(doc(db, 'ad_placements', p.id), { ...p, updatedAt: serverTimestamp() });
  }

  const categories = [
    { name: "Cattle (Cows)", icon: "🐄", listings: 1245, active: true },
    { name: "Buffalo", icon: "🐃", listings: 2340, active: true },
    { name: "Goats", icon: "🐐", listings: 1890, active: true },
    { name: "Sheep", icon: "🐑", listings: 670, active: true },
    { name: "Horses", icon: "🐎", listings: 340, active: true },
    { name: "Dogs", icon: "🐕", listings: 980, active: true },
    { name: "Cats", icon: "🐈", listings: 560, active: true },
    { name: "Birds", icon: "🦜", listings: 430, active: true },
    { name: "Poultry", icon: "🐔", listings: 780, active: true },
    { name: "Rabbits", icon: "🐇", listings: 210, active: true },
    { name: "Oxen / Bulls", icon: "🐂", listings: 520, active: true },
    { name: "Fish", icon: "🐟", listings: 180, active: false },
    { name: "Others", icon: "🦎", listings: 90, active: true },
  ];
  for (const c of categories) {
    await addDoc(collection(db, 'categories'), { ...c, createdAt: serverTimestamp() });
  }

  const languages = [
    { code: "en", name: "English", users: 8500, completion: 100, active: true },
    { code: "hi", name: "Hindi", users: 6200, completion: 100, active: true },
    { code: "gu", name: "Gujarati", users: 2800, completion: 95, active: true },
    { code: "ta", name: "Tamil", users: 1900, completion: 88, active: true },
    { code: "te", name: "Telugu", users: 1600, completion: 82, active: true },
    { code: "bn", name: "Bengali", users: 1400, completion: 78, active: true },
    { code: "kn", name: "Kannada", users: 1100, completion: 72, active: true },
    { code: "mr", name: "Marathi", users: 900, completion: 85, active: true },
    { code: "pa", name: "Punjabi", users: 700, completion: 68, active: true },
    { code: "ml", name: "Malayalam", users: 450, completion: 45, active: false },
    { code: "or", name: "Odia", users: 300, completion: 30, active: false },
  ];
  for (const l of languages) {
    await setDoc(doc(db, 'languages', l.code), { ...l, createdAt: serverTimestamp() });
  }

  await setDoc(doc(db, 'config', 'platform'), {
    appName: "PashuBazaar", supportEmail: "support@pashubazaar.in",
    supportPhone: "+91 1800-123-4567", maxPhotosPerAd: 5,
    premiumAdPrice: 499, featuredListingPrice: 299, boostAdPrice: 199, commissionRate: 5,
    autoApproveListings: true, requirePhoneVerification: true, allowGuestBrowsing: false,
    enableChatFeature: true, emailOnNewReport: true, emailOnNewRegistration: false,
    pushNotificationForChat: true, weeklyAnalyticsDigest: true, updatedAt: serverTimestamp()
  });

  console.log('Initial data seeded to Firestore');
};
