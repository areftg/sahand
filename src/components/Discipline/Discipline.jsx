import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import style from "./Discipline.module.css";
import Dropdown from "../DropDown/DropDown";
import ScoreFormat from "../../utils/ScoreFormat";
import drop from "../../assets/icons/Drop.svg";
import Graph from "../../assets/icons/Graph.svg";
import api, { endpoints } from "../../config/api.js";

// تابع کمکی برای دریافت تاریخ جلالی با فرمت YYYY/MM/DD
const getCurrentJalaliDate = () => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tehran'
  }).format(today);
  return formattedDate.replace(/-/g, '/');
};

// useAuth component
const useAuth = () => {
  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {
        return null;
      }
    }
    return null;
  }, []);
  return { user };
};

// StudentList component
const StudentList = ({
  teacherSchedule,
  currentSelectedClass,
  onClassSelect,
  students,
  studentScores,
  onScoreChange,
  activeDropdown,
  onDropdownToggle,
  isLoading,
}) => {
  return (
    <div className={style.StudentList}>
      <div className={style.header}>
        <div className={style.right}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.21723 0.266602C6.0644 0.266602 5.12711 1.18476 5.12711 2.31406C5.12711 3.44336 6.0644 4.36152 7.21723 4.36152C8.37006 4.36152 9.30734 3.44336 9.30734 2.31406C9.30734 1.18476 8.37006 0.266602 7.21723 0.266602ZM2.27933 4.74542C2.03766 4.77741 1.82865 4.95017 1.70455 5.25728L0.189214 10.0944C0.0226577 10.5871 0.267593 11.0861 0.685616 11.1693L1.70455 11.3997C2.12257 11.4828 2.53406 11.2525 2.61897 10.7598L3.79466 5.84593C3.87957 5.43644 3.61178 5.00775 3.19375 4.92457L2.54059 4.77101C2.45568 4.75182 2.36097 4.73582 2.27933 4.74542ZM5.28387 5.1805C4.86585 5.1805 4.70909 5.66678 4.70909 5.66678C4.37598 7.05841 3.53993 10.7534 3.45502 11.2461C3.28846 12.0651 3.69669 12.7209 4.0298 13.2936C4.36291 13.7862 8.38312 20.0054 8.9677 20.7412C9.47063 21.397 9.96703 21.7137 10.7182 21.3043C11.3027 20.9779 11.2342 20.1622 10.9011 19.5895C10.5679 19.0169 6.45956 12.4746 6.45956 12.4746L7.29561 9.60814C7.29561 9.60814 7.80181 10.248 8.05327 10.6575C8.13818 10.8206 8.29494 10.9038 8.62805 11.067C9.04608 11.2301 9.9801 11.8188 10.483 12.0651C10.986 12.3114 11.564 12.3786 11.8155 11.8859C12.0669 11.4764 11.7371 10.9998 11.3191 10.8366C10.9011 10.6735 9.15058 9.60814 9.15058 9.60814C9.15058 9.60814 8.21656 7.63106 7.71363 6.48576C7.2107 5.50362 6.89391 5.1805 6.22442 5.1805H5.28387ZM17.6678 5.99949C16.7436 5.99949 15.9957 6.7321 15.9957 7.63746C15.9957 8.54282 16.7436 9.27542 17.6678 9.27542C18.592 9.27542 19.3399 8.54282 19.3399 7.63746C19.3399 6.7321 18.592 5.99949 17.6678 5.99949ZM14.402 9.3522C14.1505 9.3522 13.9121 9.51536 13.8272 9.7617L12.7299 13.2936C12.5633 13.6199 12.7364 13.9526 13.0695 14.0358L13.9056 14.1893C14.1571 14.2725 14.5 14.0262 14.5849 13.7798L15.4209 10.1712C15.5058 9.84487 15.2544 9.61454 15.0029 9.53136L14.402 9.3522ZM16.257 10.0944C15.9239 10.0944 15.839 10.4271 15.839 10.4271C15.5875 11.4093 15.0878 13.6263 15.0029 14.0358C14.918 14.6916 15.1695 15.0851 15.4209 15.4946C15.6724 15.8209 18.5822 20.4021 19.0003 20.8948C19.4183 21.3874 19.7514 21.6306 20.2543 21.3043C20.6723 21.0579 20.6887 20.4853 20.4372 20.0758C20.1857 19.6663 17.1714 14.9315 17.1714 14.9315L17.6678 13.2936L18.1642 14.0358C18.2491 14.1989 18.3308 14.1797 18.5822 14.3429C18.8337 14.506 19.9147 14.9987 20.3327 15.1619C20.6658 15.325 21.1851 15.4114 21.3516 15.0851C21.6031 14.7588 21.4235 14.4293 21.0904 14.2661L19.0786 13.2936C19.0786 13.2936 18.4255 11.8028 18.0074 11.067C17.6743 10.3311 17.4131 10.0944 16.9101 10.0944H16.257ZM3.37664 14.3429L2.69735 16.6463C2.69735 16.6463 0.953413 19.1128 0.450478 19.7687C0.117366 20.2613 -0.219011 20.914 0.450478 21.4066C1.11997 21.8993 1.71108 21.2275 2.04419 20.818C2.3773 20.4917 3.71628 18.6234 4.13431 18.1307C4.38577 17.8044 4.5458 17.558 4.63071 17.3117C4.71562 17.1485 4.8038 16.979 4.97035 16.5695L3.37664 14.3429ZM15.0813 16.16L14.5849 17.8748C14.5849 17.8748 13.3243 19.6855 12.9912 20.1781C12.7397 20.5876 12.4882 20.9779 12.9912 21.3043C13.4941 21.7137 13.9154 21.2211 14.1669 20.8948C14.4183 20.6484 15.4046 19.276 15.6561 18.9497C15.8226 18.7033 15.9108 18.5242 15.9957 18.361C16.0806 18.1979 16.1721 18.0475 16.257 17.7212L15.0813 16.16Z" fill="white" />
          </svg>
          <h1>لیست دانش آموزان</h1>
          <p>{/* Logic to show absent count can be added here if needed */}</p>
        </div>
        <div className={style.left}>
          {isLoading ? (
            <Skeleton height={40} width={200} style={{ borderRadius: "8px" }} />
          ) : (
            <>
              {teacherSchedule.length > 0 && (
                <Dropdown
                  options={teacherSchedule.map((c) => ({ value: c.id, label: c.name }))}
                  defualt={currentSelectedClass ? currentSelectedClass.name : "انتخاب کلاس از برنامه"}
                  onSelect={onClassSelect}
                  isOpen={activeDropdown === 'discipline-class'}
                  onToggle={() => onDropdownToggle('discipline-class')}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className={style.table}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className={style.row} key={index}>
              <Skeleton height={40} style={{ borderRadius: "8px" }} />
            </div>
          ))
        ) : students.length === 0 ? (
          <div className={style.message}>دانش‌آموزی یافت نشد</div>
        ) : (
          students.map((st, index) => (
            <div className={style.row} key={st.enrollment_id}>
              <div className={`${style.item} ${style.displaynone}`}>{index + 1}</div>
              <div className={`${style.item} ${style.displaynone}`}><p>{st.first_name}</p></div>
              <div className={`${style.item} ${style.displaynone}`}><p>{st.last_name}</p></div>
              <div className={`${style.item} ${style.displayon}`}><p>{st.full_name}</p></div>
              <Link to={`/student/${st.student_id}`} className={style.item}>
                <img src={Graph} alt="مشاهده سوابق" />
                <p>مشاهده سوابق</p>
              </Link>
              <div className={style.item}>
                <ScoreFormat
                  className={style.input1}
                  value={studentScores[st.enrollment_id] || ''}
                  onChange={(e) => onScoreChange(st.enrollment_id, e.target.value)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// SearchBarMobile component
const SearchBarMobile = ({
  teacherSchedule,
  onClassSelect,
  currentSelectedClass,
  onSendScores,
  searchQuery,
  onSearchChange,
  activeDropdown,
  onDropdownToggle,
  isSubmitting,
}) => {
  const handleSecondOptionClick = (classItem) => {
    onDropdownToggle(null);
    onClassSelect({ value: classItem.id, label: classItem.name });
  };

  return (
    <div className={style.SearchBar1}>
      <div className={style.SearchContainer}>
        <div className={style.Search}>
          <input
            className={style.input}
            placeholder="جستجوی دانش‌آموز..."
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        <button className={style.button} onClick={onSendScores} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ثبت...' : 'ثبت نمرات'}
        </button>
      </div>
      <div className={style.dropdownsContainer}>
        <div className={style.dropdown}>
          <button onClick={() => onDropdownToggle('mobile-class')} className={style.dropdownButton}>
            <img src={drop} alt="icon" className={`${style.icon} ${activeDropdown === 'mobile-class' ? style.rotated : ""}`} />
            {currentSelectedClass ? currentSelectedClass.name : "یک کلاس انتخاب کنید"}
          </button>
          {activeDropdown === 'mobile-class' && (
            <ul className={style.dropdownMenu}>
              {teacherSchedule && teacherSchedule.length > 0 ? (
                teacherSchedule.map((classItem) => (
                  <li key={classItem.id} className={style.dropdownItem} onClick={() => handleSecondOptionClick(classItem)}>
                    {classItem.name}
                  </li>
                ))
              ) : (
                <li className={style.dropdownItemDisabled}>کلاسی یافت نشد</li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className={style.submit}>
        <div className={style.submitbutton} onClick={onSendScores} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ثبت...' : 'ثبت نمرات'}
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ onSendScores, searchQuery, onSearchChange, isSubmitting }) => (
  <div className={style.SearchBar}>
    <div className={style.SearchContainer}>
      <div className={style.Search}>
        <input
          className={style.input}
          placeholder="جستجوی دانش‌آموز..."
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      <button className={style.button} onClick={onSendScores} disabled={isSubmitting}>
        {isSubmitting ? 'در حال ثبت...' : 'ثبت نمرات'}
      </button>
    </div>
  </div>
);

// Main Discipline component
export default function Discipline() {
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classFetchError, setClassFetchError] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentScores, setStudentScores] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDropdownToggle = (dropdownId) => {
    setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get(endpoints.classes());
        setTeacherSchedule(response.data.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClassFetchError("خطا در دریافت اطلاعات کلاس‌ها.");
      } finally {
        setIsLoadingClasses(false);
      }
    };
    if (user?.school_id) { fetchClasses(); } else { setIsLoadingClasses(false); }
  }, [user]);

  // <<< تغییر اصلی اینجاست: دریافت نمرات از همان درخواست اول >>>
  useEffect(() => {
    const selectedClassId = selectedClass?.id;
    if (!selectedClassId) {
      setStudents([]);
      setStudentScores({});
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchStudentsAndInitialScores = async () => {
      setIsLoadingStudents(true);
      setStudents([]);
      setStudentScores({});

      try {
        const response = await api.get(endpoints.getclassdiscipline(selectedClassId), { signal });

        const initialScores = {};
        const formattedStudents = response.data.data.map(record => {
          // اگر نمره‌ای از قبل وجود داشت، آن را در state اولیه قرار بده
          if (record.discipline_score && record.discipline_score.score !== null) {
            initialScores[record.enrollment_id] = record.discipline_score.score;
          }

          return {
            enrollment_id: record.enrollment_id,
            student_id: record.student.id,
            first_name: record.student.first_name,
            last_name: record.student.last_name,
            full_name: `${record.student.first_name || ''} ${record.student.last_name || ''}`.trim()
          };
        });

        if (signal.aborted) return;
        setStudents(formattedStudents);
        setStudentScores(initialScores); // ست کردن نمرات اولیه

      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error(`Error fetching data for class ${selectedClassId}:`, err);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudentsAndInitialScores();

    return () => {
      controller.abort();
    };
  }, [selectedClass]);

  useEffect(() => {
    if (teacherSchedule.length > 0 && !selectedClass) {
      setSelectedClass(teacherSchedule[0]);
    }
  }, [teacherSchedule]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) {
      return students;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return students.filter((student) =>
      (student.full_name || '').toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, students]);

  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };

  const handleScoreChange = (enrollmentId, score) => {
    setStudentScores((prevScores) => ({ ...prevScores, [enrollmentId]: score }));
  };

  const handleSendScores = async () => {
    const recorded_on = getCurrentJalaliDate();

    const scoresPayload = Object.entries(studentScores)
      .filter(([enrollmentId, score]) => score !== null && score !== '')
      .map(([enrollmentId, score]) => ({
        enrollment_id: parseInt(enrollmentId, 10),
        score: score,
        recorded_on: recorded_on,
      }));

    if (scoresPayload.length === 0) {
      alert("هیچ نمره‌ای برای ثبت وارد نشده است.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { scores: scoresPayload };
      await api.post(endpoints.postdisciplinescores(), payload);
      alert("نمرات با موفقیت ثبت شد!");
    } catch (err) {
      console.error("Error submitting scores:", err);
      alert("خطا در ثبت نمرات. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassSelect = (option) => {
    const newSelectedClass = teacherSchedule.find((c) => c.id === option.value);
    setSelectedClass(newSelectedClass);
    setSearchQuery("");
    setActiveDropdown(null);
  };


  const renderStudentContent = () => {
    const isInitialLoading = isLoadingClasses || isLoadingStudents;

    if (classFetchError) {
      return <div className={style.message}>{classFetchError}</div>;
    }
    if (!isLoadingClasses && teacherSchedule.length === 0) {
      return <div className={style.message}>کلاسی برای شما تعریف نشده است.</div>;
    }

    return (
      <StudentList
        isLoading={isInitialLoading}
        teacherSchedule={teacherSchedule}
        currentSelectedClass={selectedClass}
        onClassSelect={handleClassSelect}
        students={filteredStudents}
        studentScores={studentScores}
        onScoreChange={handleScoreChange}
        activeDropdown={activeDropdown}
        onDropdownToggle={handleDropdownToggle}
      />
    );
  };

  return (
    <div className={style.Discipline}>
      <SearchBar
        onSendScores={handleSendScores}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isSubmitting={isSubmitting}
/>
      <SearchBarMobile
        teacherSchedule={teacherSchedule}
        onClassSelect={handleClassSelect}
        currentSelectedClass={selectedClass}
        onSendScores={handleSendScores}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeDropdown={activeDropdown}
        onDropdownToggle={handleDropdownToggle}
        isSubmitting={isSubmitting}
      />
      {renderStudentContent()}
    </div>
  );
}

