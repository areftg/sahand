import './App.css';
import { ToastContainer } from 'react-toastify';
import { Routes, Route } from 'react-router-dom';
import React, { useState, Suspense, useEffect } from 'react'; // ADDED: useEffect

// START: ADDED - Import the Intro component
import Loading from './components/Loading/Loading.jsx';

// END: ADDED

// Import Pages
import Dashbord from './pages/Dashbord/Dashbord.jsx';
import Stuinfo from './pages/Stuinfo/Stuinfo.jsx';
import Login from './pages/Login/Login.jsx';
import Record from './pages/Record/Record.jsx';
import Accounting from './pages/Accounting/Accounting.jsx';
import Meetings from './pages/Meetings/Meetings.jsx';
import Chat from './pages/chat/Chat.jsx';
import PageNotFound from './components/Erorr/Types/PageNotFound.jsx';
import WeekDayEdit from "./pages/WeekDayEdit/WeekDayEdit.jsx"
import About from './pages/About/About.jsx'
import AddStudent from './pages/AddStudent/AddStudent.jsx';
import AddTeacher from './pages/AddTeacher/AddTeacher.jsx';
import AddDeputy from './pages/AddDeputy/AddDeputy.jsx';
import EditUser from './pages/EditUser/EditUser.jsx';
import AddClass from './pages/AddClass/AddClass.jsx';
import CheckList from './pages/Checklist/CheckList.jsx'
import Document from './pages/Document/Document.jsx';
import Mdocument from "./pages/Mdocument/Mdocument.jsx";
import EditSchool from "./pages/EditSchool/EditSchool.jsx";
import AboutSchool from './components/AboutSchool/AboutSchool.jsx';
import Hozor from './pages/Hozor/Hozor.jsx';
import Parent from "./pages/Parent/Parent.jsx"
import ParentDashboard from "./pages/ParentDashboard/ParentDashboard.jsx"
import RecordPage from './pages/RecordPage/RecordPage.jsx';


import DocPrint from './components/DocPrint/DocPrint.jsx';
import Hozorr from "./components/Hozorr/Hozorr.jsx"
import GiveScore from './components/GiveScore/GiveScore.jsx';
import StudentList from './components/StudentList/StudentList.jsx';
import Teacher from './components/Teachers/Teacher.jsx';
import Members from './components/Members/Members.jsx';
import Week from './components/Week/Week.jsx';
import Graph from './components/Graph/Graph.jsx';
import ScoreRow from './components/ScoreRow/ScoreRow.jsx';
import ErorrAccess from './components/Erorr/Types/ErorrAccess.jsx'
import Todo from "./components/Todo/Todo.jsx"
import DocumentPart1 from './components/DocumentPart1/DocumentPart1.jsx';
import DocumentPart2 from './components/DocumentPart2/DocumentPart2.jsx';
import DocumentPart3 from './components/DocumentPart3/DocumentPart3.jsx';
import DocumentPart4 from './components/DocumentPart4/DocumentPart4.jsx';
import DocumentPart5 from './components/DocumentPart5/DocumentPart5.jsx';
import DocumentPart6 from './components/DocumentPart6/DocumentPart6.jsx';
import DocumentPart7 from './components/DocumentPart7/DocumentPart7.jsx';
import DocumentPart8 from './components/DocumentPart8/DocumentPart8.jsx';
import MeetingPart1 from "./components/MeetingPart1/MeetingPart1.jsx";
import MeetingPart2 from "./components/MeetingPart2/MeetingPart2.jsx";
import MeetingPart3 from "./components/MeetingPart3/MeetingPart3.jsx";
import MeetingPart4 from "./components/MeetingPart4/MeetingPart4.jsx";
import { AlertProvider } from './Context/AlertContext.jsx';
import { AuthProvider } from "./Context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import PLastRecord from "./components/PLastRecord/PLastRecord.jsx"
import PAbsenceList from "./components/PAbsenceList/PAbsenceList.jsx"
import PAbsenceGraph from "./components/PAbsenceGraph/PAbsenceGraph.jsx"
import PLeave from "./components/PLeave/PLeave.jsx"
import PCallSchool from "./components/PCallSchool/PCallSchool.jsx"
import Recordpdf from './components/Recordpdf/Recordpdf.jsx';
import Discipline from "./components/Discipline/Discipline.jsx"

import Print from './pages/Print/Print.jsx';

import NotificationPanel from "./components/NotificationPanel/NotificationPanel.jsx"
import WeeklyReporPDF from './components/WeeklyReporPDF/WeeklyReporPDF.jsx';

import { useNotif } from './Context/Notif.jsx';
import Token from "./Context/Token.jsx"
import Fetch from "./Context/FetchSchools.jsx"
import InterceptorSetup from "./Context/InterceptorSetup.jsx"
import SelectSchool from "./Context/SelectSchool.jsx"
import moment from 'jalali-moment';
import PrivateRoute from './components/PrivateRoute.jsx';
import Absencelist from './components/Absencelist/Absencelist.jsx';
import Pdashboard from './components/Pdashboard/Pdashboard.jsx';

import NetworkErrorModal from "./components/NetworkErrorModal/NetworkErrorModal.jsx";
import InstallPWA from './components/InstallPWA/InstallPWA.jsx';




function App() {


  const { isModalopen, setisModalopen } = useNotif();

  const handelnotifclose = () => {
    setisModalopen(false)
  }
  // START: ADDED - State and effect for the intro screen
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // 4 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this effect runs only once
  // END: ADDED

  
  return (
    <AuthProvider>
      <AlertProvider>
        {/* <Token />
        <Fetch /> */}
        <NetworkErrorModal />
          
          
        <div className="App">
         
          <InstallPWA />


          {showIntro && <Loading />}
          {/* END: ADDED */}
          {isModalopen && <NotificationPanel onClose={handelnotifclose} />}

          <InterceptorSetup />
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational','deputy-executive', 'principal']}>
                <Dashbord />
              </ProtectedRoute>}>
                <Route index element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive', 'principal']}>
                  <StudentList />
                </ProtectedRoute>} />
                <Route path='teachers' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive' , 'principal']}>
                  <Teacher />
                </ProtectedRoute>} />
                <Route path='members' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive' , 'principal']}>
                  <Members />
                </ProtectedRoute>} />
                <Route path='week' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive' , 'principal']}>
                  <Week />
                </ProtectedRoute>} />
              </Route>
              {/*              Parent            */}
              <Route path='/Parent' element={<ProtectedRoute allowedRoles={['parent']}><Parent /></ProtectedRoute>} />
              <Route path='/Parent/Dashboard' element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>}>
                <Route index element={<PLastRecord />} />
                <Route path='PAbsenceList' element={<PAbsenceList />} />
                <Route path='PAbsenceGraph' element={<PAbsenceGraph />} />
                <Route path='PLeave' element={<PLeave />} />
                <Route path='PCallSchool' element={<PCallSchool />} />
              </Route>

              <Route path="/Print/:id" element={<Print />} />
              <Route path="/weeklyreport" element={<WeeklyReporPDF />} />
              <Route path="/WeekDayEdit" element={<WeekDayEdit />} />

              <Route path="/student/:studentId" element={<Stuinfo />}>
                <Route index element={<Graph />} />
                <Route path='scorerow' element={<ScoreRow />} />
                <Route path='Absencelist' element={<Absencelist />} />
              </Route>

              <Route path='/Meetings/Document' element={<Mdocument />}>
                <Route index element={<MeetingPart1 />} />
                <Route path='2' element={<MeetingPart2 />} />
                <Route path='3' element={<MeetingPart3 />} />
                <Route path='4' element={<MeetingPart4 />} />
              </Route>


              <Route path='/Accounting/Document' element={<Document />}>
                <Route index element={<DocumentPart1 />} />
                <Route path='2' element={<DocumentPart2 />} />
                <Route path='3' element={<DocumentPart3 />} />
                <Route path='4' element={<DocumentPart4 />} />
                <Route path='5' element={<DocumentPart5 />} />
                <Route path='6' element={<DocumentPart6 />} />
                <Route path='7' element={<DocumentPart7 />} />
                <Route path='8' element={<DocumentPart8 />} />
              </Route>
              <Route path='/AddClass' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive' , 'principal']}>
                <AddClass />
              </ProtectedRoute>} />
              <Route path='/AddStudent' element={<AddStudent />} />

              <Route path='/Printdoc/:docid' element={<DocPrint />} />

              <Route path='/AddStudent/:studentId' element={<AddStudent />} />
              <Route path='/AddTeacher' element={<AddTeacher />} />
              <Route path='/AddTeacher/:teacherId' element={<AddTeacher />} />
              <Route path='/AddDeputy' element={<AddDeputy />} />
              <Route path='/AddDeputy/:deputyid' element={<AddDeputy />} />
              <Route path='/EditUser' element={<EditUser />} />
              <Route path='/EditSchool' element={<EditSchool />} />
              <Route path='/About' element={<About />} />
              <Route path='/AboutSchool' element={<AboutSchool />} />
              <Route path='/CheckList' element={<CheckList />} />
              <Route path="/" element={<Recordpdf />} />
              <Route path="/record/:studentId" element={<RecordPage />} />
              

              <Route path='/Hozor/' element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'deputy-educational', 'deputy-executive', 'principal']}><Hozor /></ProtectedRoute>} >
                <Route index element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'deputy-educational', 'deputy-executive', 'principal']}><Hozorr /></ProtectedRoute>} />
                <Route path='GiveScore' element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><GiveScore /></ProtectedRoute>} />
                <Route path='Todo' element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><Todo /></ProtectedRoute>} />
                 <Route path='Discipline' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', "deputy-executive"]}><Discipline /></ProtectedRoute>} />
              </Route>

              <Route path='/Record' element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'deputy-educational', 'deputy-executive', 'principal']}>
                <Record />
              </ProtectedRoute>} />
              <Route path='/Accounting' element={<ProtectedRoute allowedRoles={['admin', 'principal']}>
                <Accounting />
              </ProtectedRoute>} />
              <Route path='/Meetings' element={<ProtectedRoute allowedRoles={['admin', 'principal']}>
                <Meetings />
              </ProtectedRoute>} />
              <Route path='teachers' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive', 'principal']}>
                <Teacher />
              </ProtectedRoute>} />
              <Route path='members' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive', 'principal']}>
                <Members />
              </ProtectedRoute>} />
              <Route path='week' element={<ProtectedRoute allowedRoles={['admin', 'deputy-educational', 'deputy-executive', 'principal']}>
                <Week />
              </ProtectedRoute>} />
            </Route>

            <Route path='/ErrorAccess' element={<ErorrAccess />} />
            <Route path='*' element={<PageNotFound />} />

            <Route path='/Login' element={<Login />} />
          </Routes>


          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>

      </AlertProvider>
    </AuthProvider>
  );
}

export default App;