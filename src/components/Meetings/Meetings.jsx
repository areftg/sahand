import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dropdown from '../DropDown/DropDown';
import Skeleton from 'react-loading-skeleton';
import DynamicTooltip from '../../components/DynamicTooltip/DynamicTooltip';
import api, { endpoints } from '../../config/api.js';
import styles from './Meetings.module.css';
import EditCheckModal from '../EditCheckModal/EditCheckModal.jsx';
import MeetingFrame, { FormDataProvider } from '../MeetingFrame/MeetingFrame.jsx';
import Editcheck from '../../assets/icons/Editcheck.svg';
import Pan from '../../assets/icons/pan.svg';
import Trash from '../../assets/icons/Trash.svg';
import Print from '../../assets/icons/print.svg';
import MeetingPart1 from '../MeetingPart1/MeetingPart1';
import MeetingPart2 from '../MeetingPart2/MeetingPart2';
import MeetingPart3 from '../MeetingPart3/MeetingPart3';
import MeetingPart4 from '../MeetingPart4/MeetingPart4';
import { showSuccessNotification, showErrorNotification } from '../../services/notificationService';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import Cheq from '../Cheq/Cheq';

export default function Meetings({ onClose }) {
  const [expandedId, setExpandedId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [chequesData, setChequesData] = useState({});
  const [loadingCheques, setLoadingCheques] = useState(false);
  const [view, setView] = useState('list');
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [showDeleteQuestion, setShowDeleteQuestion] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showCheqModal, setShowCheqModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const observer = useRef();
  const LOCAL_STORAGE_KEY = 'meetingDocumentFormData';

  const lastRowRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleAddMeeting = () => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setShowQuestionBox(true);
      setView('question');
    } else {
      setView('form');
      setCurrentStep(1);
    }
  };

  const handleConfirm = () => {
    setShowQuestionBox(false);
    setView('form');
    setCurrentStep(1);
  };

  const handleCancel = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowQuestionBox(false);
    setView('form');
    setCurrentStep(1);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (view === 'form' || view === 'edit') {
          setView('list');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, view]);

  const stopPropagation = (e) => e.stopPropagation();

  const options1 = [
    { value: 'apple', label: 'به ترتیب تاریخ' },
    { value: 'mango', label: 'به ترتیب مبلغ صعودی' },
    { value: 'banana', label: 'به ترتیب مبلغ نزولی' },
  ];

  const handleSelect = (option) => {
    console.log('انتخاب شد:', option);
  };

  const handleToggle = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setLoadingCheques(true);
    setExpandedId(id);

    if (!chequesData[id]) {
      try {
        const res = await api.get(`${endpoints.meets}/${id}/cheques`);
        setChequesData((prev) => ({ ...prev, [id]: res.data.data }));
      } catch (err) {
        console.error('خطا در گرفتن چک‌ها:', err);
        showErrorNotification('خطا در بارگذاری چک‌ها.');
      }
    }
    setLoadingCheques(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  };

  const getmeetList = () => {
    let active = true;
    setLoading(true);
    api
      .get(`${endpoints.meets}?page=${page}`)
      .then((res) => {
        if (!active) return;
        setMeetings((prev) => (page === 1 ? res.data.data : [...prev, ...res.data.data]));
        setHasMore(res.data.links?.next !== null);
      })
      .catch((err) => {
        console.error('خطا در گرفتن جلسات:', err);
        showErrorNotification('خطا در بارگذاری جلسات.');
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }
  useEffect(() => {

    getmeetList()
  }, [page]);

  const handleDeleteMeeting = (id) => {
    setDeleteItem({ type: 'meeting', id });
    setShowDeleteQuestion(true);
  };

  const handleDeleteCheque = (meetingId, chequeId) => {
    setDeleteItem({ type: 'cheque', id: chequeId, meetingId });
    setShowDeleteQuestion(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === 'meeting') {
        await api.delete(`${endpoints.meets}/${deleteItem.id}`);
        setMeetings((prev) => prev.filter((m) => m.id !== deleteItem.id));
        showSuccessNotification('جلسه با موفقیت حذف شد.');
      } else if (deleteItem.type === 'cheque') {
        await api.delete(`${endpoints.cheques}/${deleteItem.id}`);
        setChequesData((prev) => ({
          ...prev,
          [deleteItem.meetingId]: prev[deleteItem.meetingId].filter((c) => c.id !== deleteItem.id),
        }));
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === deleteItem.meetingId ? { ...m, cheques_count: m.cheques_count - 1 } : m
          )
        );
        showSuccessNotification('چک با موفقیت حذف شد.');
      }
    } catch (err) {
      console.error(`خطا در حذف ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'}:`, err);
      showErrorNotification(`خطا در حذف ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'}.`);
    } finally {
      setShowDeleteQuestion(false);
      setDeleteItem(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteQuestion(false);
    setDeleteItem(null);
  };

  const handleEditMeeting = (meeting) => {
    localStorage.setItem('session_id', meeting.id);
    setEditData({ type: 'meeting', data: meeting });
    setShowCheqModal(true);
  };

  const handleEditCheque = (meetingId, chequeId) => {
    localStorage.setItem('session_id', meetingId);
    localStorage.setItem('cheque_id', chequeId);
    setEditData({ type: 'cheque', chequeId, meetingId });
    setShowCheqModal(true);
  };

  const handleAddCheque = (meetingId) => {
    localStorage.setItem('session_id', meetingId);
    setEditData(null);
    setShowCheqModal(true);
  };

  const handleCheqSubmit = async (cheqData) => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) throw new Error('session_id not found in localStorage');

      if (cheqData.id) {
        // ویرایش چک
        const response = await api.put(`${endpoints.cheques}/${cheqData.id}`, cheqData);
        const updatedCheque = response.data.data;
        getmeetList()
        // setChequesData((prev) => ({
        //   ...prev,
        //   [sessionId]: prev[sessionId].map((c) =>
        //     c.id === updatedCheque.id ? updatedCheque : c
        //   ),
        // }));
        // showSuccessNotification('چک با موفقیت ویرایش شد.');
      } else {
        // اضافه کردن چک جدید
        const response = await api.post(`${endpoints.cheques}`, {
          ...cheqData,
          meeting_id: sessionId,
        });
        const newCheque = response.data.data;
        setChequesData((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId] ? [...prev[sessionId], newCheque] : [newCheque],
        }));
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === sessionId ? { ...m, cheques_count: (m.cheques_count || 0) + 1 } : m
          )
        );
        showSuccessNotification('چک با موفقیت اضافه شد.');
        getmeetList()
      }
    } catch (err) {
      console.error(
        `خطا در ${cheqData.id ? 'ویرایش چک' : 'اضافه کردن چک'}:`,
        err
      );
      showErrorNotification(
        `خطا در ${cheqData.id ? 'ویرایش چک' : 'اضافه کردن چک'}.`
      );
    } finally {
      setShowCheqModal(false);
      setEditData(null);
      localStorage.removeItem('session_id');
      localStorage.removeItem('cheque_id');
    }
  };

  const handleMeetingSubmit = async (formData) => {
    try {
      const response = await api.post(endpoints.meets, formData);
      setMeetings((prev) => [response.data.data, ...prev]);
      showSuccessNotification('جلسه با موفقیت ثبت شد.');
      setView('list');
    } catch (error) {
      console.error('خطا در ثبت جلسه:', error);
      showErrorNotification('خطا در ثبت جلسه.');
    }
  };

  const stepComponents = [MeetingPart1, MeetingPart2, MeetingPart3, MeetingPart4];

  if (showCheqModal) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={stopPropagation}>
          <Cheq
            onClose={onClose}
            setShowCheq={setShowCheqModal}
            editMode={editData?.type === 'cheque'}
            initialData={editData?.type === 'cheque' ? {} : editData?.data || {}}
            meetingId={editData?.meetingId || localStorage.getItem('session_id')}
            onSubmit={handleCheqSubmit}
            isModal={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={stopPropagation}>
        {view === 'list' && (
          <>
            <div className={styles.header}>
              <div className={styles.close} onClick={onClose}>
                <svg viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.93907 0.806396L0.0307617 3.7147L17.7967 21.4807L0.0307617 39.2466L2.93907 42.1549L20.705 24.389L38.471 42.1549L41.3793 39.2466L23.6133 21.4807L41.3793 3.7147L38.471 0.806396L20.705 18.5723L2.93907 0.806396Z"
                    fill="#000"
                  />
                </svg>
              </div>
              <div className={styles.meetings}>
                <div className={styles.right}>
                  <p>جلسات</p>
                </div>
                <div className={styles.left}>
                  <button onClick={handleAddMeeting}>
                    <svg viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.876 36.3978C28.7714 36.3978 36.7927 28.3765 36.7927 18.4811C36.7927 8.58574 28.7714 0.564453 18.876 0.564453C8.98061 0.564453 0.95932 8.58574 0.95932 18.4811C0.95932 28.3765 8.98061 36.3978 18.876 36.3978ZM17.0843 11.3145C17.0843 10.8393 17.2731 10.3836 17.6091 10.0476C17.9451 9.71155 18.4008 9.52279 18.876 9.52279C19.3512 9.52279 19.8069 9.71155 20.1429 10.0476C20.4789 10.3836 20.6677 10.8393 20.6677 11.3145V16.6895H26.0427C26.5178 16.6895 26.9736 16.8782 27.3096 17.2142C27.6456 17.5502 27.8343 18.0059 27.8343 18.4811C27.8343 18.9563 27.6456 19.412 27.3096 19.748C26.9736 20.084 26.5178 20.2728 26.0427 20.2728H20.6677V25.6478C20.6677 26.123 20.4789 26.5787 20.1429 26.9147C19.8069 27.2507 19.3512 27.4395 18.876 27.4395C18.4008 27.4395 17.9451 27.2507 17.6091 26.9147C17.2731 26.5787 17.0843 26.123 17.0843 25.6478V20.2728H11.7093C11.2341 20.2728 10.7784 20.084 10.4424 19.748C10.1064 19.412 9.91765 18.9563 9.91765 18.4811C9.91765 18.0059 10.1064 17.5502 10.4424 17.2142C10.7784 16.8782 11.2341 16.6895 11.7093 16.6895H17.0843V11.3145Z"
                        fill="white"
                      />
                    </svg>
                    جلسه جدید
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.container}>
              <div className={styles.meetings_header}>
                <div className={styles.right}>
                  <svg
                    width="32"
                    height="26"
                    viewBox="0 0 24 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.55586 7.93516H23.2902V10.1664H6.55586V7.93516ZM6.55586 1.24141H23.2902V3.47266H6.55586V1.24141ZM6.55586 14.6289H23.2902V16.8602H6.55586V14.6289ZM2.09336 7.37734C1.64954 7.37734 1.22389 7.55365 0.91006 7.86748C0.59623 8.18131 0.419922 8.60696 0.419922 9.05078C0.419922 9.4946 0.59623 9.92025 0.91006 10.2341C1.22389 10.5479 1.64954 10.7242 2.09336 10.7242C2.53718 10.7242 2.96283 10.5479 3.27666 10.2341C3.59049 9.92025 3.7668 9.4946 3.7668 9.05078C3.7668 8.60696 3.59049 8.18131 3.27666 7.86748C2.96283 7.55365 2.53718 7.37734 2.09336 7.37734ZM2.09336 14.0711C1.64954 14.0711 1.22389 14.2474 0.91006 14.5612C0.59623 14.8751 0.419922 15.3007 0.419922 15.7445C0.419922 16.1884 0.59623 16.614 0.91006 16.9278C1.22389 17.2417 1.64954 17.418 2.09336 17.418C2.53718 17.418 2.96283 17.2417 3.27666 16.9278C3.59049 16.614 3.7668 16.1884 3.7668 15.7445C3.7668 15.3007 3.59049 14.8751 3.27666 14.5612C2.96283 14.2474 2.53718 14.0711 2.09336 14.0711ZM2.09336 0.683594C1.64954 0.683594 1.22389 0.859902 0.91006 1.17373C0.59623 1.48756 0.419922 1.91321 0.419922 2.35703C0.419922 2.80085 0.59623 3.2265 0.91006 3.54033C1.22389 3.85416 1.64954 4.03047 2.09336 4.03047C2.53718 4.03047 2.96283 3.85416 3.27666 3.54033C3.59049 3.2265 3.7668 2.80085 3.7668 2.35703C3.7668 1.91321 3.59049 1.48756 3.27666 1.17373C2.96283 0.859902 2.53718 0.683594 2.09336 0.683594Z"
                      fill="white"
                    />
                  </svg>
                  <h1>لیست جلسات</h1>
                </div>
                <div className={styles.left}>
                  <div className={styles.filter}>
                    <Dropdown options={options1} default={'به ترتیب تاریخ '} onSelect={handleSelect} />
                  </div>
                </div>
              </div>

              <div className={styles.title}>
                <div className={styles.itemtopcontainer}>
                  <div className={styles.item}>
                    <p>ردیف</p>
                  </div>
                  <div className={styles.item}>
                    <p>تاریخ</p>
                  </div>
                  <div className={styles.item}>
                    <div className={styles.text}>
                      <p className={styles.textShort}>توضیحات</p>
                    </div>
                  </div>
                  <div className={styles.item}>
                    <p>تعداد چک های صادر شده</p>
                  </div>
                <div className={styles.item}>
                  <button className={styles.button}>چک</button>
                </div>
                </div>
              </div>

              <div className={styles.table}>
                {loading && page === 1 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      duration={2}
                      highlightColor="#69b0b2"
                      count={1}
                      style={{ margin: '8px 0', borderRadius: '6px', padding: '30px 0' }}
                      height={50}
                    />
                  ))
                ) : (
                  meetings.map((meeting, index) => {
                    const content = (
                      <>
                        <div className={styles.top}>
                          <div className={styles.itemcontainer}>
                            <div className={styles.item}>
                              <p>{index + 1}</p>
                            </div>
                            <div className={styles.item}>
                              <p>{formatDate(meeting.date)}</p>
                            </div>
                            <div className={styles.item}>
                              <div className={styles.text}>
                                <DynamicTooltip content={meeting.comment}>
                                  <p className={styles.textShort}>{meeting.comment}</p>
                                </DynamicTooltip>
                              </div>
                            </div>
                            <div
                              className={`${styles.item} ${styles.leftitem}`}
                              onClick={() => handleToggle(meeting.id)}
                            >
                              <p>{meeting.cheques_count}</p>
                              <div className={styles.Dropdown}>
                                <svg
                                  className={`${styles.arrowIcon} ${expandedId === meeting.id ? styles.rotate : ''}`}
                                  width="26"
                                  height="16"
                                  viewBox="0 0 26 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z"
                                    fill="white"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className={styles.buttoncontainer}>
                            <button className={styles.button} onClick={() => handleAddCheque(meeting.id)}>
                              <img src={Editcheck} alt="add cheque" />
                            </button>
                          </div>
                        </div>

                        {expandedId === meeting.id && (
                          loadingCheques ? (
                            <>
                              <div className={styles.dash}></div>
                              <Skeleton count={meeting.cheques_count || 2} height={50} style={{ borderRadius: 6 }} />
                            </>
                          ) : !chequesData[meeting.id]?.length ? (
                            <>
                              <div className={styles.dash}></div>
                              <div className={styles.center}>
                                <div className={styles.null}>
                                  <p>چکی یافت نشد.</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            chequesData[meeting.id].map((check, i) => (
                              <React.Fragment key={check.id || i}>
                                <div className={styles.dash}></div>
                                <div className={styles.center}>
                                  <div className={styles.itemcontainer}>
                                    <div className={styles.item}>
                                      <p>--</p>
                                    </div>
                                    <div className={styles.item}>
                                      <p>{formatDate(check.issueDate)}</p>
                                    </div>
                                    <div className={styles.item}>
                                      <div className={styles.text}>
                                        <p className={styles.textShort}>
                                          مبلغ: {check.amount?.toLocaleString()} ریال
                                        </p>
                                      </div>
                                    </div>
                                    <div className={styles.item}>
                                      <p>در وجه: {check.recieverName}</p>
                                    </div>
                                  </div>
                                  <div className={styles.buttoncontainer}>
                                    <button
                                      className={styles.button}
                                      onClick={() => handleAddCheque(meeting.id)}
                                    >
                                      <img src={Editcheck} alt="add cheque" />
                                    </button>
                                  </div>
                                </div>
                              </React.Fragment>
                            ))
                          )
                        )}
                      </>
                    );

                    if (meetings.length === index + 1) {
                      return (
                        <div className={styles.row} ref={lastRowRef} key={meeting.id}>
                          {content}
                        </div>
                      );
                    }
                    return (
                      <div className={styles.row} key={meeting.id}>
                        {content}
                      </div>
                    );
                  })
                )}

                {loading && page > 1 && (
                  Array.from({ length: 2 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      duration={2}
                      highlightColor="#69b0b2"
                      count={1}
                      style={{ margin: '8px 0', borderRadius: '6px', padding: '30px 0' }}
                      height={50}
                    />
                  ))
                )}

                {!hasMore && !loading && (
                  <p style={{ textAlign: 'center', padding: '10px' }}>پایان لیست جلسات</p>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'edit' && (
          <FormDataProvider>
            <EditCheckModal
              check={selectedCheck}
              onBack={() => setView('list')}
              onClose={onClose}
            />
          </FormDataProvider>
        )}

        {view === 'form' && (
          <FormDataProvider>
            <MeetingFrame
              isModal={true}
              onClose={() => setView('list')}
              onSubmit={handleMeetingSubmit}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            >
              {React.createElement(stepComponents[currentStep - 1])}
            </MeetingFrame>
          </FormDataProvider>
        )}
        {showQuestionBox && (
          <QuestionBox
            message="یک جلسه تکمیل نشده پیدا شد. آیا می‌خواهید با آن ادامه دهید؟"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
        {showDeleteQuestion && (
          <QuestionBox
            message={`آیا از حذف این ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'} مطمئن هستید؟`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </div>
  );
}