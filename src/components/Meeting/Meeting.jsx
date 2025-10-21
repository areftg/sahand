
import style from './Meeting.module.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../DropDown/DropDown';
import Pen from '../../assets/icons/pan.svg';
import unavailable from '../../assets/icons/unavailable_1.svg';
import Trash from '../../assets/icons/Trash.svg';
import Editcheck from '../../assets/icons/Editcheck.svg';
import Print from '../../assets/icons/print.svg';
import cancelCheq from '../../assets/icons/cancel.cheq.svg';
import DynamicTooltip from '../../components/DynamicTooltip/DynamicTooltip';
import api, { endpoints } from '../../config/api.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import Cheq from '../Cheq/Cheq';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../../services/notificationService';
import DocumentPart7 from '../DocumentPart7/DocumentPart7';
import EditMeetingModal from '../EditMeetingModal/EditMeetingModal.jsx';
import moment from 'jalali-moment';
import LoadingScreen from '../LoadingSpinner/LoadingSpinner.jsx';
import FiscalYear from '../../Context/FiscalYear.jsx';
import ReasonModal from '../ReasonModal/ReasonModal';

export default function Meeting() {
  const options1 = [
    { value: 'apple', label: 'به ترتیب تاریخ' },
    { value: 'mango', label: 'به ترتیب مبلغ صعودی' },
    { value: 'banana', label: 'به ترتیب مبلغ نزولی' },
  ];

  const handleSelect = (option) => {
    console.log('انتخاب شد:', option);
  };

  const [expandedId, setExpandedId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [tempMeetings, setTempMeetings] = useState([]);
  const [tempChequesData, setTempChequesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [chequesData, setChequesData] = useState({});
  const [loadingCheques, setLoadingCheques] = useState(false);
  const [showDeleteQuestion, setShowDeleteQuestion] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showCheqModal, setShowCheqModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editerror, setError] = useState([]);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [voidItem, setVoidItem] = useState(null);
  const [showVoidOptions, setShowVoidOptions] = useState(false);
  const [voidOption, setVoidOption] = useState(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceType, setReplaceType] = useState(null);
  const [newChequeId, setNewChequeId] = useState(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [suspendItem, setSuspendItem] = useState(null);
  const [showVoidUnusedConfirm, setShowVoidUnusedConfirm] = useState(false);
  const [replaceAmount, setReplaceAmount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const [editLoadingStates, setEditLoadingStates] = useState({});
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingVoidParams, setPendingVoidParams] = useState(null);

  const observer = useRef();

  const lastRowRef = useCallback(
    (node) => {
      if (loading || isRefreshing) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, isRefreshing, hasMore]
  );

  useEffect(() => {
    const openEditModal = localStorage.getItem('openEditModal');
    const formData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
    if (openEditModal === 'true' && formData.id) {
      setEditId(formData.id);
      setShowEditModal(true);
      localStorage.removeItem('openEditModal');
    }
  }, []);

  const fetchMeetings = useCallback(async (page, activeRef, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await api.get(`${endpoints.meets}?page=${page}`);
      if (!activeRef.current) return;
      if (isRefresh) {
        setTempMeetings(meetings);
        setTempChequesData(chequesData);
      }
      setMeetings((prev) =>
        page === 1 ? res.data.data : [...prev, ...res.data.data]
      );
      setHasMore(res.data.links?.next !== null);
    } catch (err) {
      console.error("خطا در گرفتن جلسات:", err);
      showErrorNotification("خطا در بارگذاری جلسات.");
    } finally {
      if (activeRef.current) {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, []);

  const fetchCheques = useCallback(async (meetingId, activeRef) => {
    try {
      setLoadingCheques(true);
      const res = await api.get(`${endpoints.meets}/${meetingId}/cheques`);
      if (!activeRef.current) return;
      setChequesData((prev) => ({ ...prev, [meetingId]: res.data.data }));
    } catch (err) {
      console.error('خطا در گرفتن چک‌ها:', err);
      showErrorNotification('خطا در بارگذاری چک‌ها.');
      setError([err.message || 'خطای نامشخص']);
    } finally {
      if (activeRef.current) setLoadingCheques(false);
    }
  }, []);

  const refreshMeetings = useCallback(async () => {
    if (meetings.length === 0) return;
    const currentExpandedId = expandedId;
    setPage(1);
    setChequesData({});
    setExpandedId('');
    const activeRef = { current: true };
    await fetchMeetings(1, activeRef, true);
    if (currentExpandedId && meetings.some((m) => m.id === currentExpandedId)) {
      setExpandedId(currentExpandedId);
      await fetchCheques(currentExpandedId, activeRef);
    }
  }, [fetchMeetings, fetchCheques, expandedId, meetings]);

  useEffect(() => {
    const activeRef = { current: true };
    fetchMeetings(page, activeRef);
    return () => {
      activeRef.current = false;
    };
  }, [page, fetchMeetings]);

  const handleToggle = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!chequesData[id]) {
      const activeRef = { current: true };
      await fetchCheques(id, activeRef);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  };

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
      setIsRefreshing(true);
      if (deleteItem.type === 'meeting') {
        await api.delete(`${endpoints.meets}/${deleteItem.id}`);
        showSuccessNotification('جلسه با موفقیت حذف شد.');
      } else if (deleteItem.type === 'cheque') {
        await api.delete(`${endpoints.cheques}/${deleteItem.id}`);
        showSuccessNotification('چک با موفقیت حذف شد.');
      }
      await refreshMeetings();
    } catch (err) {
      console.error(`خطا در حذف ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'}:`, err);
      showErrorNotification(`خطا در حذف ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'}.`);
    } finally {
      setShowDeleteQuestion(false);
      setDeleteItem(null);
      setIsRefreshing(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteQuestion(false);
    setDeleteItem(null);
  };

  const handleEditMeeting = async (meeting) => {
    try {
      setEditLoadingStates((prev) => ({ ...prev, [meeting.id]: true }));
      localStorage.removeItem('meetingDocumentFormData');
      const response = await api.get(`${endpoints.meets}/${meeting.id}`);
      const meetingData = response.data.data;
      const mergedData = { ...meetingData, edit: true };
      localStorage.setItem('meetingDocumentFormData', JSON.stringify(mergedData));
      localStorage.setItem('session_id', meetingData.id);
      setEditId(meetingData.id);
      setShowEditModal(true);
    } catch (error) {
      console.error('خطا در دریافت اطلاعات جلسه:', error);
      showErrorNotification('خطا در بارگذاری اطلاعات جلسه برای ویرایش.');
    } finally {
      setEditLoadingStates((prev) => ({ ...prev, [meeting.id]: false }));
    }
  };

  const handleEditCheque = (meetingId, chequeId) => {
    const cheque = chequesData[meetingId]?.find((c) => c.id === chequeId);
    if (cheque && cheque.is_used) {
      showErrorNotification('این چک استفاده شده و قابل ویرایش نیست.');
      return;
    }
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
      setIsRefreshing(true);
      const sessionId = localStorage.getItem('session_id');
      if (!cheqData.id && !sessionId) {
        throw new Error('session_id not found in localStorage');
      }
      if (cheqData.id) {
        await api.put(`${endpoints.cheques}/${cheqData.id}`, cheqData);
        showSuccessNotification('چک با موفقیت ویرایش شد.');
      } else {
        await api.post(`${endpoints.cheques}`, {
          ...cheqData,
          meeting_id: sessionId,
        });
        showSuccessNotification('چک با موفقیت اضافه شد.');
      }
      await refreshMeetings();
    } catch (err) {
      console.error(`خطا در ${cheqData.id ? 'ویرایش چک' : 'اضافه کردن چک'}:`, err);
      const errorMessage = err.response?.data?.message || `خطا در ${cheqData.id ? 'ویرایش چک' : 'اضافه کردن چک'}.`;
      showErrorNotification(errorMessage);
    } finally {
      // setShowCheqModal(false);
      setEditData(null);
      setIsRefreshing(false);
      if (!cheqData.id) {
        localStorage.removeItem('session_id');
      }
      localStorage.removeItem('cheque_id');
    }
  };

  const handleVoidCheque = (meetingId, chequeId) => {
    const cheque = chequesData[meetingId]?.find((c) => c.id === chequeId);
    if (!cheque) return;
    setVoidItem({ meetingId, chequeId });
    setReplaceAmount(cheque.amount);
    if (cheque.is_used) {
      setShowVoidConfirm(true);
    } else {
      setShowVoidUnusedConfirm(true);
    }
  };

  const confirmVoid = async (params, reason) => {
    if (!voidItem && !suspendItem) return;
    try {
      setIsRefreshing(true);
      const payload = { type: params.type, reason: reason || '' };
      if (params.type === 'void_and_replace' || params.type === 'release') {
        if (!params.newChequeId) throw new Error('شناسه چک جدید وارد نشده است.');
        payload.new_cheque_id = params.newChequeId;
      }
      const chequeId = suspendItem?.chequeId || voidItem?.chequeId;
      await api.post(`${endpoints.cheques}/${chequeId}/manage`, payload);
      showSuccessNotification(params.type === 'release' ? 'چک با موفقیت تعلیق و جایگزین شد.' : 'چک با موفقیت باطل شد.');
      const data = localStorage.getItem('meetingDocumentFormData');
      if (data) {
        try {
          let parsed = JSON.parse(data);
          if ('chequeIds' in parsed) {
            const keys = Object.keys(parsed);
            if (keys.length === 1) {
              localStorage.removeItem('meetingDocumentFormData');
            } else {
              delete parsed.chequeIds;
              localStorage.setItem('meetingDocumentFormData', JSON.stringify(parsed));
            }
          }
        } catch (err) {
          console.error('خطا در parse کردن meetingDocumentFormData:', err);
        }
      }
      if (params.type === 'void_and_replace') {
        setShowReplaceModal(true);
        setReplaceType(params.type);
      } else {
        await refreshMeetings();
        resetVoidStates();
      }
    } catch (err) {
      console.error(params.type === 'release' ? 'خطا در تعلیق چک:' : 'خطا در ابطال چک:', err);
      showErrorNotification(params.type === 'release' ? 'خطا در تعلیق چک.' : 'خطا در ابطال چک.');
      resetVoidStates();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVoidConfirmYes = () => {
    setShowVoidConfirm(false);
    setShowVoidOptions(true);
  };

  const handleVoidUnusedConfirmYes = () => {
    setShowVoidUnusedConfirm(false);
    setPendingVoidParams({ type: 'void' });
    setShowReasonModal(true);
  };

  const handleSuspendCheque = (meetingId, chequeId) => {
    const cheque = chequesData[meetingId]?.find((c) => c.id === chequeId);
    if (!cheque) return;
    if (!cheque.is_used) {
      showWarningNotification('این چک استفاده نشده و قابل تعلیق نیست.');
      return;
    }
    setSuspendItem({ meetingId, chequeId });
    setReplaceAmount(cheque.amount);
    setShowSuspendConfirm(true);
  };

  const confirmSuspend = () => {
    setShowSuspendConfirm(false);
    setPendingVoidParams({ type: 'release' });
    setShowReasonModal(true);
  };

  const handleReplaceSubmit = async (selectedChequeId) => {
    try {
      if (replaceType === 'release' || replaceType === 'void_and_replace') {
        await confirmVoid({ type: replaceType, newChequeId: selectedChequeId });
      }
      setNewChequeId(selectedChequeId);
      await refreshMeetings();
      resetVoidStates();
    } catch (err) {
      console.error('خطا در تأیید چک جدید:', err);
      showErrorNotification('خطا در تأیید چک جدید.');
    }
  };

  const handleVoidOptionSelectReplace = () => {
    setVoidOption('replace');
    setReplaceType('void_and_replace');
    setShowVoidOptions(false);
    setPendingVoidParams({ type: 'void_and_replace' });
    setShowReasonModal(true);
  };

  const handleVoidOptionSelectDeleteDoc = () => {
    setVoidOption('delete_doc');
    setShowVoidOptions(false);
    setPendingVoidParams({ type: 'void_and_delete_doc' });
    setShowReasonModal(true);
  };

  const handleReasonSubmit = (reason) => {
    setShowReasonModal(false);
    if (pendingVoidParams.type === 'void_and_replace' || pendingVoidParams.type === 'release') {
      setShowReplaceModal(true);
    } else {
      confirmVoid(pendingVoidParams, reason);
    }
  };

  const resetVoidStates = () => {
    setShowVoidConfirm(false);
    setShowVoidOptions(false);
    setShowReplaceModal(false);
    setShowSuspendConfirm(false);
    setShowVoidUnusedConfirm(false);
    setShowReasonModal(false);
    setVoidItem(null);
    setSuspendItem(null);
    setVoidOption(null);
    setReplaceType(null);
    setReplaceAmount(0);
    setPendingVoidParams(null);
  };

  const isUsed = () => {
    const title = editerror.document_details?.title || 'عنوان نامشخص';
    showWarningNotification(`این چک استفاده شده است: ${title}`);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditId(null);
    localStorage.removeItem('meetingDocumentFormData');
    localStorage.removeItem('openEditModal');
    localStorage.removeItem('session_id');
  };

  return (
    <div className={style.container}>
      <FiscalYear />
      <div className={style.header}>
        <div className={style.right}>
          <svg width="32" height="26" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.55586 7.93516H23.2902V10.1664H6.55586V7.93516ZM6.55586 1.24141H23.2902V3.47266H6.55586V1.24141ZM6.55586 14.6289H23.2902V16.8602H6.55586V14.6289ZM2.09336 7.37734C1.64954 7.37734 1.22389 7.55365 0.91006 7.86748C0.59623 8.18131 0.419922 8.60696 0.419922 9.05078C0.419922 9.4946 0.59623 9.92025 0.91006 10.2341C1.22389 10.5479 1.64954 10.7242 2.09336 10.7242C2.53718 10.7242 2.96283 10.5479 3.27666 10.2341C3.59049 9.92025 3.7668 9.4946 3.7668 9.05078C3.7668 8.60696 3.59049 8.18131 3.27666 7.86748C2.96283 7.55365 2.53718 7.37734 2.09336 7.37734ZM2.09336 14.0711C1.64954 14.0711 1.22389 14.2474 0.91006 14.5612C0.59623 14.8751 0.419922 15.3007 0.419922 15.7445C0.419922 16.1884 0.59623 16.614 0.91006 16.9278C1.22389 17.2417 1.64954 17.418 2.09336 17.418C2.53718 17.418 2.96283 17.2417 3.27666 16.9278C3.59049 16.614 3.7668 16.1884 3.7668 15.7445C3.7668 15.3007 3.59049 14.8751 3.27666 14.5612C2.96283 14.2474 2.53718 14.0711 2.09336 14.0711ZM2.09336 0.683594C1.64954 0.683594 1.22389 0.859902 0.91006 1.17373C0.59623 1.48756 0.419922 1.91321 0.419922 2.35703C0.419922 2.80085 0.59623 3.2265 0.91006 3.54033C1.22389 3.85416 1.64954 4.03047 2.09336 4.03047C2.53718 4.03047 2.96283 3.85416 3.27666 3.54033C3.59049 3.2265 3.7668 2.80085 3.7668 2.35703C3.7668 1.91321 3.59049 1.48756 3.27666 1.17373C2.96283 0.859902 2.53718 0.683594 2.09336 0.683594Z" fill="white" />
          </svg>
          <h1>لیست جلسات</h1>
        </div>
        <div className={style.left}>
          <div className={style.filter}>
            <Dropdown options={options1} default={'به ترتیب تاریخ '} onSelect={handleSelect} />
          </div>
        </div>
      </div>

      <div className={style.title}>
        <div className={style.itemtopcontainer}>
          <div className={style.item}>
            <p>ردیف</p>
          </div>
          <div className={style.item}>
            <p>تاریخ</p>
          </div>
          <div className={style.item}>
            <div className={style.text}>
              <p className={style.textShort}>توضیحات</p>
            </div>
          </div>
          <div className={style.item}>
            <p>تعداد چک های صادر شده</p>
          </div>
        </div>
        <div className={style.buttontopcontainer}>
          <button className={style.button}>ویرایش</button>
          <button className={style.button}>حذف</button>
          <button className={style.button}>چاپ</button>
          <button className={style.button}>چک</button>
        </div>
      </div>

      <div className={style.table}>
        {(loading && page === 1 && !isRefreshing) ? (
          Array.from({ length: 9 }).map((_, idx) => (
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
          (isRefreshing ? tempMeetings : meetings).map((meeting, index) => {
            const content = (
              <>
                <div className={style.top}>
                  <div className={style.itemcontainer}>
                    <div className={style.item}>
                      <p>{index + 1}</p>
                    </div>
                    <div className={style.item}>
                      <p>{formatDate(meeting.sessionDate)}</p>
                    </div>
                    <div className={style.item}>
                      <div className={style.text}>
                        <DynamicTooltip content={meeting.comment}>
                          <p className={style.textShort}>{meeting.comment}</p>
                        </DynamicTooltip>
                      </div>
                    </div>
                    <div
                      className={`${style.item} ${style.leftitem}`}
                      onClick={() => handleToggle(meeting.id)}
                    >
                      <p>{meeting.cheques_count}</p>
                      <div className={style.Dropdown}>
                        <svg
                          className={`${style.arrowIcon} ${expandedId === meeting.id ? style.rotate : ''}`}
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

                  <div className={style.buttoncontainer}>
                    <button
                      className={style.button}
                      onClick={() => handleEditMeeting(meeting)}
                      disabled={editLoadingStates[meeting.id]}
                    >
                      {editLoadingStates[meeting.id] ? (
                        <LoadingScreen />
                      ) : (
                        <img src={Pen} alt="ویرایش" />
                      )}
                    </button>
                    <button className={style.button} onClick={() => handleDeleteMeeting(meeting.id)}>
                      <img src={Trash} alt="delete" />
                    </button>
                    <button className={`${style.button} ${style.none}`}>
                      <img src={Print} alt="print" />
                    </button>
                    <button className={style.button} onClick={() => handleAddCheque(meeting.id)}>
                      <img src={Editcheck} alt="add cheque" />
                    </button>
                  </div>
                </div>

                {expandedId === meeting.id && (
                  loadingCheques ? (
                    <>
                      <div className={style.dash}></div>
                      <Skeleton count={meeting.cheques_count || 2} height={100} style={{ borderRadius: 6 }} />
                    </>
                  ) : !(isRefreshing ? tempChequesData[meeting.id] : chequesData[meeting.id])?.length ? (
                    <>
                      <div className={style.dash}></div>
                      <div className={style.center}>
                        <div className={style.null}>
                          <p>چکی یافت نشد.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    (isRefreshing ? tempChequesData[meeting.id] : chequesData[meeting.id]).map((check, i) => (
                      <React.Fragment key={check.id || i}>
                        <div className={style.dash}></div>
                        <div className={style.title1}>
                          <div className={style.itemtopcontainer}>
                            <div className={style.item}>
                              <p>چک</p>
                            </div>
                            <div className={style.item}>
                              <p>تاریخ</p>
                            </div>
                            <div className={style.item}>
                              <div className={style.text}>
                                <p className={style.textShort}>مبلغ</p>
                              </div>
                            </div>
                            <div className={style.item}>
                              <p>در وجه</p>
                            </div>
                          </div>
                          <div className={style.buttontopcontainer}>
                            <button className={style.button}>ویرایش</button>
                            <button className={style.button}>ابطال</button>
                            <button className={style.button}>تعلیق</button>
                            <button className={style.button}>چک</button>
                          </div>
                        </div>
                        <div className={style.center}>
                          <div className={style.itemcontainer}>
                            <div className={style.item}>
                              <p>--</p>
                            </div>
                            <div className={style.item}>
                              <p>{formatDate(check.issueDate)}</p>
                            </div>
                            <div className={style.item}>
                              <div className={style.text}>
                                <p className={style.textShort}>
                                  {check.amount?.toLocaleString()} ریال
                                </p>
                              </div>
                            </div>
                            <div className={style.item}>
                              <p>{check.recieverName?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className={style.buttoncontainer}>
                            {check.is_used ? (
                              <DynamicTooltip content="این چک استفاده شده و قابل ویرایش نیست">
                                <button className={`${style.button} ${style.is_used}`} onClick={isUsed}>
                                  <img src={Editcheck} alt="edit cheque" />
                                </button>
                              </DynamicTooltip>
                            ) : (
                              <button
                                className={style.button}
                                onClick={() => handleEditCheque(meeting.id, check.id)}
                              >
                                <img src={Editcheck} alt="edit cheque" />
                              </button>
                            )}
                            <button
                              className={style.button}
                              onClick={() => handleVoidCheque(meeting.id, check.id)}
                            >
                              <img src={unavailable} alt="void cheque" />
                            </button>
                            {check.is_used ? (
                              <button
                                className={style.button}
                                onClick={() => handleSuspendCheque(meeting.id, check.id)}
                              >
                                <img src={cancelCheq} alt="suspend cheque" />
                              </button>
                            ) : (
                              <DynamicTooltip content="این چک استفاده نشده و قابل تعلیق نیست">
                                <button
                                  className={`${style.button} ${style.is_used}`}
                                  onClick={() => showWarningNotification('این چک استفاده نشده و قابل تعلیق نیست.')}
                                >
                                  <img src={cancelCheq} alt="suspend cheque" />
                                </button>
                              </DynamicTooltip>
                            )}
                            <button className={style.button}>
                              <img src={Editcheck} alt="edit cheque" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  )
                )}
              </>
            );

            if ((isRefreshing ? tempMeetings : meetings).length === index + 1) {
              return (
                <div className={style.row} ref={lastRowRef} key={meeting.id}>
                  {content}
                </div>
              );
            }
            return (
              <div className={style.row} key={meeting.id}>
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

        {!hasMore && !loading && !isRefreshing && (
          <p style={{ textAlign: 'center', padding: '10px' }}>پایان لیست جلسات</p>
        )}
      </div>

      {showDeleteQuestion && (
        <QuestionBox
          message={`آیا از حذف این ${deleteItem.type === 'meeting' ? 'جلسه' : 'چک'} مطمئن هستید؟`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={isRefreshing}
        />
      )}

      {showVoidConfirm && (
        <QuestionBox
          message="این چک به سندی متصل است. آیا می‌خواهید آن را باطل کنید؟"
          onConfirm={handleVoidConfirmYes}
          onCancel={resetVoidStates}
          isLoading={isRefreshing}
        />
      )}

      {showVoidOptions && (
        <QuestionBox
          message="برای ابطال چک متصل به سند، یکی از گزینه‌ها را انتخاب کنید:"
          onConfirm={handleVoidOptionSelectReplace}
          onCancel={handleVoidOptionSelectDeleteDoc}
          isLoading={isRefreshing}
          confirmText="جایگزین با چک جدید"
          cancelText="حذف سند همراه چک"
        />
      )}

      {showSuspendConfirm && (
        <QuestionBox
          message="آیا می‌خواهید این چک را تعلیق کنید؟ (نیاز به جایگزین دارد)"
          onConfirm={confirmSuspend}
          onCancel={resetVoidStates}
          isLoading={isRefreshing}
        />
      )}

      {showVoidUnusedConfirm && (
        <QuestionBox
          message="آیا می‌خواهید این چک را باطل کنید؟"
          onConfirm={handleVoidUnusedConfirmYes}
          onCancel={resetVoidStates}
          isLoading={isRefreshing}
        />
      )}

      {showEditModal && (
        <EditMeetingModal onClose={handleEditModalClose} />
      )}

      {showCheqModal && (
        <Cheq
          setShowCheq={setShowCheqModal}
          editMode={editData?.type === 'cheque'}
          initialData={editData?.type === 'cheque' ? {} : editData?.data || {}}
          meetingId={editData?.meetingId || localStorage.getItem('session_id')}
          onSubmit={handleCheqSubmit}
          isModal={true}
        />
      )}

      {showReplaceModal && (
        <DocumentPart7
          onSelectCheque={handleReplaceSubmit}
          minAmount={replaceAmount}
          maxAmount={replaceAmount}
          onClose={resetVoidStates}
        />
      )}

      {showReasonModal && (
        <ReasonModal
          title={pendingVoidParams?.type === 'release' ? 'دلیل تعلیق چک' : 'دلیل ابطال چک'}
          onSubmit={handleReasonSubmit}
          onCancel={resetVoidStates}
        />
      )}
    </div>
  );
}
