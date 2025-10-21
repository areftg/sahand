import { getRoles } from "@testing-library/dom";
import axios from "axios";

export const API_BASE_URL = "https://conor-comedic-brett.ngrok-free.dev/api/v1";

// https://api-sahand.arcanix.ir/api/v1


const api = axios.create({
  // baseURL from here was removed to prevent duplicate URLs.
  headers: {
    'Accept': 'application/json',
    "Content-Type": "application/json",
     "ngrok-skip-browser-warning": "true"
     
  },
});
// "ngrok-skip-browser-warning": "true"

let failedRequests = [];
let onNetworkError = null;


// ثبت هندلر برای نمایش مودال قطعی اینترنت
export const setNetworkErrorHandler = (handler) => {
  onNetworkError = handler;
};

// * تلاش مجدد فقط برای درخواست‌های fail شده
// */
// در فایل api.js
export const retryFailedRequests = async (onSuccessCallback) => {
  const requests = [...failedRequests];
  failedRequests = [];
  let successCount = 0;
  let errorCount = 0;
  const failedUrls = []; // برای ذخیره URLهای درخواست‌های ناموفق

  for (let req of requests) {
    try {
      const { method, url, data, params } = req;
      console.log(`Retrying request: ${method} ${url}`, { data, params });
      const response = await api({
        method: method || 'get',
        url,
        data,
        params,
      });
      successCount++;
      console.log(`Retry successful for ${url}, Response:`, response.data);
    } catch (err) {
      errorCount++;
      failedUrls.push(req.url);
      console.error(`Retry failed for ${req.url}:`, err.message);
    }
  }

  // اگر درخواست‌های موفقی وجود داشت، callback را فراخوانی کن
  if (successCount > 0 && onSuccessCallback) {
    onSuccessCallback();
  }

  return { successCount, errorCount, failedUrls };
};

// Interceptor عمومی
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.log("Network error, saving request:", error.config);
      failedRequests.push(error.config);
      if (onNetworkError) {
        onNetworkError();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Safely retrieves the user object from localStorage.
 * This function ensures we always get the latest user data.
 * @returns {object|null} The parsed user object or null if not found/invalid.
 */
const getUserFromStorage = () => {
  try {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

/**
 * A collection of functions to generate API endpoints dynamically.
 * This ensures the most current school_id is used for every request.
 */
export const endpoints = {

  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  schools: `${API_BASE_URL}/schools`,
  children: `${API_BASE_URL}/guardians/get-children`,
  docs: `${API_BASE_URL}/docs`,
  meets: `${API_BASE_URL}/sessions`,
  cheques: `${API_BASE_URL}/cheques`,
  chequebooks: `${API_BASE_URL}/chequebooks`,
  accounts: `${API_BASE_URL}/accounts`,
  bankaccounts: `${API_BASE_URL}/bank-accounts`,
  FiscalYear: `${API_BASE_URL}/fiscal-year/check-date-status`,
  SwitchFiscalYear:`${API_BASE_URL}/schools/2/close-year`,
  

  
  deleteemployment: (employment) => {
    
    return `${API_BASE_URL}/employments/${employment}`;
  },
   absencelist: (enrolmentid) => {

    return `${API_BASE_URL}/enrollments/${enrolmentid}/attendance-summary`;
  },
   updatedeputy: (id) => {

    return `${API_BASE_URL}/deputies/${id}`;
  },
  getroles: () => {

    return `${API_BASE_URL}/roles?group=deputy`;
  },
  teachers: (currentPage, sortField, sortDir) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/teachers${currentPage && sortField && sortDir ? `?page=${currentPage}&sort_by=${sortField}&sort_dir=${sortDir}` : ''}`;
  },
   teacherslist: (currentPage) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/teachers?page=${currentPage}&sort_by=last_name&sort_dir=asc`;
  },
    editaddress: (addressId) => {

    return `${API_BASE_URL}/addresses/${addressId}`;
  },
    addaddress: (profileId) => {

    return `${API_BASE_URL}/profiles/${profileId}/addresses`;
  },
     addguardians: (studentId) => {

    return `${API_BASE_URL}/students/${studentId}/guardians/create-and-attach`;
  },
  addteachers: (teacherid) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/teachers/${teacherid}`;
  },
    getteachers: (teacherid) => {
       
    return `${API_BASE_URL}/teachers/${teacherid}`;
  },
  getclassschdule: (classid) => {
   
    return `${API_BASE_URL}/classes/${classid}/class-schedules`;
  },
  teacherschdule: (dayid) => {
      const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/my-schedule/${schoolId}?day_of_week_id=${dayid}`;
  },
  getclassdiscipline: (classid) => {
    return `${API_BASE_URL}/classes/${classid}/discipline-scores`;
  },
  postdisciplinescores: () => {
    return `${API_BASE_URL}/discipline-scores/bulk`;
  },
  // <calendar api 
      validreminder: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/valid-reminder-dates?group_by=month`;
  },
        teacherreminder: (month,year) => {
    return `${API_BASE_URL}/teacher-reminders?month=${month}&year=${year}`;
  },
         addreminder: (scheduleid) => {
    return `${API_BASE_URL}/class-schedules/${scheduleid}/reminders`;
  },
        deletereminder: (id) => {
    return `${API_BASE_URL}/teacher-reminders/${id}`;
  },
  // calendar api end/>
  //  <timeslot>
 timeslot: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/time-slots`;
  },
  adddtimeslot: () => {
    
    return `${API_BASE_URL}/time-slots`;
  },
    deletetimeslot: (id) => {
    return `${API_BASE_URL}/time-slots/${id}`;
  },
      addtimeslot: (formattedDate) => {
        const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/schedule-modifications`;
  },
       deleteeffective_Alert: (formattedDate) => {
        const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/schedule-modifications?date=${formattedDate}`;
  },
  effective_Alert: (date = null) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/${date ? `effective-timeslots?date=${date}` : `effective-timeslots`}`;
  },
// </timeslot>
// <profile>
  schoolprofile: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}`;
  },
  profile: () => {
    return `${API_BASE_URL}/my-profile`;
  },
// </profile>
// <hozor>
  hozor: (classId) => { 
    return `${API_BASE_URL}/classes/${classId}/attendances`;
  },
  Thozor: () => { 
    return `${API_BASE_URL}/teacher/current-attendance-sheet`;
  },
    hozorsub: (scheduleId) => {
     
    return `${API_BASE_URL}/class-schedules/${scheduleId}/attendances`;
  },
// </hozor>
// <weekday>
  weekday: (idd) => { 
    return `${API_BASE_URL}/classes/${idd}/schedule-builder`;
  },
   saveSchedule: (classid) => { 
    return `${API_BASE_URL}/classes/${classid}/schedules/sync`;
  },
    getScheduleData: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/classes/${schoolId}/schedule-builder`;
  },
  courses: (classid) => {
    return `${API_BASE_URL}/classes/${classid}/available-courses`;
  },
// </weekday>
// <givescore>
  getScoreCategory: () => { 
    return `${API_BASE_URL}/gradebook-item-templates`;
  },
   sendScore: () => { 
    return `${API_BASE_URL}/gradebook/submit-grades`;
  },
    getscore: (classschedule) => { 
    return `${API_BASE_URL}/grading-sheet/${classschedule}`;
  },
// </givescore>
  deputy: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/deputies`;
  },
    addeputy: (deputyid) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/deputies/${deputyid}`;
  },
  postcode: (postal_code) => {
    return `${API_BASE_URL}/locations/by-postal-code?postal_code=${postal_code}`;
  },

  getclass_schdule: (classId) => { 
    return `${API_BASE_URL}/classes/${classId}/enrollments`;
  },
   getPabcence: (stuid) => { 
    return `${API_BASE_URL}/students/${stuid}/attendance-reports`;
  },
  getactive: () => {
    
    return `${API_BASE_URL}/get-active-year`;
  },

  student: (stuid) => { 
    return `${API_BASE_URL}/students/${stuid}`;
  },
  employments: (currentPage, sortField, sortDir) => { 
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/employments?query=&page=${currentPage}&sort_by=${sortField}&sort_dir=${sortDir}`;
  },
  studentchart: (stuid) => { 
    return `${API_BASE_URL}/students/${stuid}/attendance-chart`;
  },
  studentrecord: (stuid) => { 
    return `${API_BASE_URL}/students/${stuid}/reports/monthly-card`;
  },
   studentallrecord: (stuid) => { 
    return `${API_BASE_URL}/students/${stuid}/reports/monthly-transcript`;
  },
  alert: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/time-slots?school_id=${schoolId}`;
    
  },
    studentstatus: (stuid) => {
   
    return `${API_BASE_URL}/enrollments/${stuid}`;
    
  },

  studentscore: (stuid) => {
   
    return `${API_BASE_URL}/enrollments/${stuid}/attendance-summary`;
    
  },
    exelupload: () => {
       const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/students/import/preview`;
    
  },
     machingexelupload: () => {
       const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/students/import`;
    
  },

  getinfos: (nationalId) => {
 
    return `${API_BASE_URL}/profiles/lookup?national_code=${nationalId}`;
  },
  students: (debouncedSearchTerm,page,sort_by,sort_dir,classId) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/students?query=&page=${page}&filter[search]=${debouncedSearchTerm}&sort_by=${sort_by}&sort_dir=${sort_dir}&${classId ? `filter[class_id]=${classId}`:``}`;
  },
    studentsrecord: (currentPage, sortField, sortDir, selectedClassId) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/students?query=&page=${currentPage}&sort_by=${sortField}&sort_dir=${sortDir}&${selectedClassId ? `filter[class_id]=${selectedClassId}`:``}`;
  },
  addstudents: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/students`;
  },
    updatestudents: (stuid) => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/students/${stuid}`;
  },
  dashboard: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/dashboard-stats`;
  },
  classes: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/classes`;
  },
  getmajor: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/offered-fields`;
  },
  getacademic: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/academic-levels`;
  },
  getgrade: () => {
    const schoolId = getUserFromStorage()?.school_id;
    return `${API_BASE_URL}/schools/${schoolId}/grade-levels`;
  },
 

  updateclass: (classId) => `${API_BASE_URL}/classes/${classId}`,

  // Location endpoints
  locations: {
    getProvinces: `${API_BASE_URL}/locations/provinces`,
    getCities: (provinceId) => `${API_BASE_URL}/locations/${provinceId}/cities`,
    getSectors: (cityId) => `${API_BASE_URL}/locations/${cityId}/sectors`,
    getZones: (sectorId) => `${API_BASE_URL}/locations/${sectorId}/zones`,
  },
};



export const getHozorStatusUrl = (scheduleId) => {
  if (!scheduleId) {
    console.error("schedule_id not provided");
    return null;
  }
  return `${API_BASE_URL}/class-schedules/${scheduleId}/attendances`;
};


/**
 * Sets or removes the Authorization token header for all API requests.
 * @param {string|null} token - The JWT token.
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * Sets or removes the X-School-ID header.
 * @param {string|number|null} schoolId
 */
export const setSchoolIdHeader = (schoolId) => {
  if (schoolId) {
    api.defaults.headers.common["X-School-ID"] = schoolId;
  } else {
    delete api.defaults.headers.common["X-School-ID"];
  }
};

/**
 * Sets up a global response interceptor to handle common HTTP errors like 401 and 403.
 * @param {function} navigate - The navigate function from React Router.
 */
export const setupResponseInterceptor = (navigate) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem("user");
        setAuthToken(null);
        navigate("/login", { state: { reason: "session-expired" } });
      } else if (status === 403) {
        navigate("/ErrorAccess", { state: { reason: "access-denied" } });
      }
      else if (status === 429) {
        navigate("/ErrorAccess", { state: { reason: "access-denied" } });
      }

      return Promise.reject(error);
    }
  );
};

export default api;
