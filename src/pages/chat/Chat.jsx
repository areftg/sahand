import React from 'react'
import styles from "./Chat.module.css"
import ChatHeader from '../../components/ChatHeader/ChatHeader'
import Sidebar from "../../components/Sidebar/Sidebar"
import ChatBox from '../../components/ChatBox/ChatBox'
export default function Chat() {
  return (
    <div className={styles.chatBack}>
     <ChatHeader/>
      <div className={styles.Sidebar}><Sidebar/></div>
      <div className={styles.chatlist}>
       <ChatBox/>
      </div>
    </div>
  )
}
