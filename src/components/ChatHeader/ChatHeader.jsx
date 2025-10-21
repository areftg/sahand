import React from 'react'
import styles from "./ChatHeader.module.css"
import asmachat from "../../assets/icons/asmachat.svg"
import asmachatlogo from "../../assets/icons/Asmachatlogo.svg"
export default function ChatHeader() {

  return (
   <> 
  
    <div className={styles.Headerback}>
       <img alt='' src={asmachat} className={styles.img}></img>
       <div className={styles.Header}>
        <div className={styles.right}>
         <p>پیامرسان داخلی هنرستان سید محمد نظام فصیحی لنگرودی</p>
         <p>4 آنلاین</p>
         <p>علی نعیمی درحال تایپ</p>
        </div>
         <div className={styles.left}>
         <p>POWERED BY:</p>
           <div className={styles.leftlogo}>
                   <img src={asmachatlogo} alt=''/>
         <p>ASMA Chat</p>
           </div>
         </div>
       </div>
    </div>
   </>
  )
}
