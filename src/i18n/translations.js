// NeerSetu_JJ Central Multilingual Dictionary
// Supported languages: Hindi (hi) & English (en)

export const TRANSLATIONS = {
  en: {
    app_name: 'NeerSetu_JJ',
    app_slogan: 'NeerSetu JalJeevan',
    app_subtitle: 'Low-Cost Rural Water Monitoring & Digital Twin',
    nav_home: 'Home',
    nav_monitor: 'Monitor',
    nav_twin: 'Digital Twin',
    nav_history: 'History',
    nav_offline: 'Offline / Sync',
    nav_health: 'System Health',
    nav_tech: 'Judge / Tech',
    nav_demo: 'SIH Demo',
    
    // Status badges & truth labels
    state_live: 'LIVE',
    state_modelled: 'MODELLED',
    state_simulated: 'SIMULATED',
    state_not_connected: 'NOT CONNECTED',
    state_cached: 'CACHED',
    
    // Water Quality Classifications
    status_good_title: 'Final Water: SAFE',
    status_good_desc: 'Safe water verified. This water is added to the final safe-water tank.',
    status_attention_title: 'Final Water: PARTIALLY SAFE',
    status_attention_desc: 'One-time re-filtration required. Keep this water in the system and test again after filtration.',
    status_critical_title: 'Final Water: CRITICAL',
    status_critical_desc: 'Unsafe final water. Use repeated purification cycles; if it still fails, reserve it for an appropriate non-potable purpose.',
    status_no_data_title: 'No Recent Data',
    status_no_data_desc: 'AquaSystem has not sent recent measurements.',
    
    status_good_badge: '🟢 SAFE',
    status_attention_badge: '🟡 PARTIAL SAFE',
    status_critical_badge: '🔴 CRITICAL',
    
    // Decision banner
    decision_good: '🟢 SAFE — No re-filtration required. Safe water is added to the final safe-water tank.',
    decision_attention: '🟡 PARTIAL SAFE — One-time re-filtration required. Test the final water again before release.',
    decision_critical: '🔴 CRITICAL — Repeated purification required. If it still fails, use only for an appropriate non-potable purpose.',
    decision_waiting: '⚪ Waiting for a final-water reading.',

    // Card labels
    aquasystem: 'AQUASYSTEM',
    water_quality: 'WATER QUALITY',
    safe_water_available: 'SAFE WATER AVAILABLE',
    final_reserve_tank: 'Final reserve tank',
    capacity_of: 'of',
    capacity: 'capacity',
    state_ready: 'READY',
    state_check: 'CHECK',
    state_empty: 'EMPTY',

    // Core parameters
    param_tds: 'TDS (Total Dissolved Solids)',
    param_tds_short: 'TDS',
    param_turbidity: 'Turbidity (Clarity)',
    param_turbidity_short: 'Turbidity',
    param_ph: 'pH (Acidity/Alkalinity)',
    param_ph_short: 'pH',
    param_temp: 'Water Temperature',
    param_temp_short: 'Temp',
    
    // Time & freshness labels
    updated_just_now: 'Updated just now (Live ESP32)',
    updated_at: 'Last measured at',
    updated_hours_ago: 'hours ago',
    updated_mins_ago: 'mins ago',
    cached_warning: 'Cached data. Live measurement unavailable.',
    
    // Buttons & actions
    btn_read_status: 'Read Status Aloud',
    btn_view_twin: 'View Digital Twin',
    btn_view_history: 'View History',
    btn_connect: 'Connect',
    btn_connecting: 'Connecting…',
    btn_connected: 'Connected',
    btn_try_again: 'Try again',
    btn_connect_ble: 'Connect AquaSystem (BLE)',
    btn_scan_qr: 'Scan QR',
    btn_switch_system: 'Switch System',
    btn_upload_now: 'Upload Now',
    btn_technician_view: 'Technician View',
    btn_close: 'Close',
    btn_inspect: 'Inspect Component',
    btn_run_whatif: 'Test What-If Scenario',
    btn_reset_simulation: 'Reset to Live',
    
    // Header & system
    system_pill_title: 'Tap to scan QR / switch AquaSystem',
    online: 'Online',
    offline: 'Offline',
    synced: '✓ Synced',

    // Offline center
    offline_banner_title: 'Offline Monitoring Active',
    offline_banner_desc: 'Internet is unavailable. Local monitoring continues directly from the ESP32.',
    offline_waiting_prefix: 'waiting to upload',
    offline_readings_waiting: 'readings saved locally',
    offline_synced_success: 'All local readings synchronized ✓',
    not_nearby: 'AquaSystem is not nearby.',
    offline_center_title: 'Offline Center & Cloud Sync',
    offline_center_sub: 'Local IndexedDB Persistence • Zero Cloud Lock-in',
    
    // Twin labels
    twin_title: 'Virtual Process Representation',
    twin_subtitle: 'Intended Integrated Purification Architecture',
    twin_notice: 'Note: Current physical prototype has independent modular containers. Digital Twin shows the future fully-integrated process.',
    tab_virtual_flow: 'Virtual Flow',
    tab_physical_vs_digital: 'Physical vs Digital Reality',
    tab_what_if: 'What-If Simulator',
    
    // Physical modules
    phys_available: 'Physically available',
    phys_module_title: 'Modular physical container',
    phys_pipeline_status: 'Pipeline integration: Future step',
    
    // Stages
    stage_raw_inlet: 'Raw Water Inlet',
    stage_coarse_screen: 'Coarse Screening Basket',
    stage_primary_mesh: 'Primary Mesh Filter',
    stage_initial_tank: 'Initial Storage Tank',
    stage_oil_sep: 'Oil-Water Separator',
    stage_filtration: 'Multi-layer Filtration Tank',
    stage_quality_chamber: 'Optical Quality Chamber (ESP32)',
    stage_heavy_metal: 'Heavy-Metal Detection Chamber',
    stage_uv_chamber: 'UV Disinfection Chamber',
    stage_final_quality: 'Final Quality Verification',
    stage_final_tank: 'Treated Water Storage & Outlet',
    
    // Health & Tech
    mcu_esp32: 'ESP32 Edge MCU',
    tinyml_status: 'TinyML Edge Model',
    tinyml_running: 'Running on ESP32 (18ms INT8)',
    optical_sensors: 'Optical LED Channels (6-Band)',
    ble_radio: 'Bluetooth Low Energy Radio',
    storage_db: 'Local Offline Database',
    cloud_sync: 'Cloud Mirror Service',
    threshold_config: 'BIS 10500 Threshold Settings'
  },
  
  hi: {
    app_name: 'नीरसेतु_जेजे',
    app_slogan: 'नीरसेतु जलजीवन',
    app_subtitle: 'सस्ता ग्रामीण जल-निगरानी और डिजिटल ट्विन तंत्र',
    nav_home: 'होम',
    nav_monitor: 'लाइव मॉनिटर',
    nav_twin: 'डिजिटल ट्विन',
    nav_history: 'इतिहास',
    nav_offline: 'ऑफलाइन / सिंक',
    nav_health: 'सिस्टम स्वास्थ्य',
    nav_tech: 'इंजीनियर / जज',
    nav_demo: 'SIH डेमो',
    
    // Status badges & truth labels
    state_live: 'लाइव',
    state_modelled: 'मॉडल किया हुआ',
    state_simulated: 'सिम्युलेटेड',
    state_not_connected: 'जुड़ा नहीं है',
    state_cached: 'कैश्ड (पुरानी माप)',
    
    // Water Quality Classifications
    status_good_title: 'अंतिम पानी: सुरक्षित',
    status_good_desc: 'सुरक्षित पानी की पुष्टि हो चुकी है। यह पानी अंतिम शुद्ध जल टंकी में जमा किया जा रहा है।',
    status_attention_title: 'अंतिम पानी: आंशिक सुरक्षित',
    status_attention_desc: 'एक बार और छानने की आवश्यकता है। इस पानी को तंत्र में रखें और दोबारा फिल्टर करके जांचें।',
    status_critical_title: 'अंतिम पानी: असुरक्षित (खराब)',
    status_critical_desc: 'तय सीमा से अधिक अशुद्धि। बार-बार शोधन करें; फिर भी ठीक न हो तो केवल गैर-पीने योग्य उपयोग में लें।',
    status_no_data_title: 'कोई नया डेटा उपलब्ध नहीं',
    status_no_data_desc: 'नीरसेतु यंत्र से हाल का कोई माप नहीं मिला है।',
    
    status_good_badge: '🟢 सुरक्षित',
    status_attention_badge: '🟡 आंशिक सुरक्षित',
    status_critical_badge: '🔴 असुरक्षित',
    
    // Decision banner
    decision_good: '🟢 सुरक्षित — दोबारा छानने की जरूरत नहीं। शुद्ध पानी अंतिम सुरक्षित टंकी में जा रहा है।',
    decision_attention: '🟡 आंशिक सुरक्षित — एक बार और छानने की आवश्यकता है। उपयोग से पहले दोबारा जांचें।',
    decision_critical: '🔴 असुरक्षित — बार-बार शोधन आवश्यक है। यदि फिर भी साफ न हो तो पीने के लिए प्रयोग न करें।',
    decision_waiting: '⚪ अंतिम पानी के माप की प्रतीक्षा है।',

    // Card labels
    aquasystem: 'जल प्रणाली (AQUASYSTEM)',
    water_quality: 'पानी की गुणवत्ता',
    safe_water_available: 'उपलब्ध सुरक्षित पानी',
    final_reserve_tank: 'अंतिम सुरक्षित पानी टंकी',
    capacity_of: 'कुल',
    capacity: 'क्षमता का',
    state_ready: 'तैयार',
    state_check: 'जांचें',
    state_empty: 'खाली',

    // Core parameters
    param_tds: 'टीडीएस (पानी में घुले ठोस कण)',
    param_tds_short: 'टीडीएस (TDS)',
    param_turbidity: 'गंदलापन (टर्बिडिटी)',
    param_turbidity_short: 'गंदलापन',
    param_ph: 'पीएच मान (खारापन/अम्लता)',
    param_ph_short: 'पीएच (pH)',
    param_temp: 'पानी का तापमान',
    param_temp_short: 'तापमान',
    
    // Time & freshness labels
    updated_just_now: 'अभी-अभी अपडेट हुआ (लाइव ESP32)',
    updated_at: 'अंतिम माप समय:',
    updated_hours_ago: 'घंटे पहले',
    updated_mins_ago: 'मिनट पहले',
    cached_warning: 'यह पुराना सहेजा डेटा है। लाइव माप अभी उपलब्ध नहीं है।',
    
    // Buttons & actions
    btn_read_status: 'बोलकर सुनाएं',
    btn_view_twin: 'डिजिटल ट्विन देखें',
    btn_view_history: 'इतिहास देखें',
    btn_connect: 'जोड़ें',
    btn_connecting: 'जुड़ रहा है…',
    btn_connected: 'जुड़ा हुआ है',
    btn_try_again: 'पुनः प्रयास करें',
    btn_connect_ble: 'नीरसेतु यंत्र जोड़ें (ब्लूटूथ)',
    btn_scan_qr: 'क्यूआर स्कैन',
    btn_switch_system: 'यंत्र बदलें',
    btn_upload_now: 'डेटा अभी भेजें',
    btn_technician_view: 'इंजीनियर / जज मोड',
    btn_close: 'बंद करें',
    btn_inspect: 'चरण की जानकारी देखें',
    btn_run_whatif: 'यदि पानी अधिक गंदा हो तो?',
    btn_reset_simulation: 'लाइव डेटा पर लौटें',
    
    // Header & system
    system_pill_title: 'क्यूआर स्कैन या यंत्र बदलने के लिए टैप करें',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    synced: '✓ सिंक किया हुआ',

    // Offline center
    offline_banner_title: 'इंटरनेट के बिना निगरानी चालू है',
    offline_banner_desc: 'इंटरनेट उपलब्ध नहीं है। फोन सीधे पास के यंत्र से माप ले रहा है।',
    offline_waiting_prefix: 'अपलोड होना बाकी',
    offline_readings_waiting: 'माप फोन में सुरक्षित हैं',
    offline_synced_success: 'सभी स्थानीय माप सर्वर पर पहुंच गए ✓',
    not_nearby: 'नीरसेतु यंत्र पास नहीं है।',
    offline_center_title: 'ऑफलाइन सेंटर और क्लाउड सिंक',
    offline_center_sub: 'स्थानीय IndexedDB भंडारण • बिना इंटरनेट पूर्ण कार्यशील',
    
    // Twin labels
    twin_title: 'वर्चुअल शोधन प्रक्रिया',
    twin_subtitle: 'भविष्य की पूर्ण एकीकृत शोधन प्रणाली',
    twin_notice: 'सच्ची स्थिति: वर्तमान प्रोटोटाइप में अलग-अलग डिब्बे (मॉड्यूल्स) हैं। डिजिटल ट्विन भविष्य की पाइपलाइन-युक्त व्यवस्था दर्शाता है।',
    tab_virtual_flow: 'शोधन प्रवाह',
    tab_physical_vs_digital: 'असली प्रोटोटाइप बनाम डिजिटल स्वरूप',
    tab_what_if: 'क्या-यदि (सिम्युलेटर)',
    
    // Physical modules
    phys_available: 'भौतिक रूप से उपलब्ध',
    phys_module_title: 'स्वतंत्र मॉड्यूल उपलब्ध',
    phys_pipeline_status: 'पाइपलाइन जोड़: आगामी चरण',
    
    // Stages
    stage_raw_inlet: 'कच्चे पानी का प्रवेश द्वार',
    stage_coarse_screen: 'मोटी छलनी (कचरा रोकने वाली)',
    stage_primary_mesh: 'प्राथमिक जाली फिल्टर',
    stage_initial_tank: 'प्रारंभिक भंडारण टंकी',
    stage_oil_sep: 'तेल अलग करने वाला कक्ष',
    stage_filtration: 'बहु-स्तरीय फिल्टर टैंक',
    stage_quality_chamber: 'ऑप्टिकल जांच कक्ष (ESP32)',
    stage_heavy_metal: 'भारी धातु पहचान कक्ष',
    stage_uv_chamber: 'पराबैंगनी (UV) कीटाणुनाशक कक्ष',
    stage_final_quality: 'अंतिम गुणवत्ता परीक्षण',
    stage_final_tank: 'शुद्ध पानी की टंकी और नल',
    
    // Health & Tech
    mcu_esp32: 'ESP32 एज माइक्रो-नियंत्रक',
    tinyml_status: 'TinyML ऑन-डिवाइस मॉडल',
    tinyml_running: 'ESP32 पर सीधे सक्रिय (18ms INT8)',
    optical_sensors: '6-बैंड ऑप्टिकल एलईडी सेंसिंग',
    ble_radio: 'ब्लूटूथ संपर्क',
    storage_db: 'स्थानीय ऑफलाइन डेटाबेस',
    cloud_sync: 'क्लाउड सिंक सेवा',
    threshold_config: 'BIS 10500 मानक सीमाएं'
  }
};
