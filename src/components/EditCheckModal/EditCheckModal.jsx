import { useState } from 'react';
import { useFormData } from '../MeetingFrame/MeetingFrame';
import ShamsiDatePicker from '../Calendar/ShamsiDatePicker';
import calenderIcon from "../../assets/icons/Calender.svg";
import styles from './EditCheckModal.module.css';


export default function EditCheckModal({ onClose, onBack }) {

    
    const [ isPickerOpen, setIsPickerOpen ] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const { formData, updateFormData } = useFormData();
  
    const handleDateSelect = (date) => {
        updateFormData({ cheqDate: date });
    };

    return (
        <>
            <div className={styles.header}>
                <div className={styles.close} onClick={onClose()}>
                <svg viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.93907 0.806396L0.0307617 3.7147L17.7967 21.4807L0.0307617 39.2466L2.93907 42.1549L20.705 24.389L38.471 42.1549L41.3793 39.2466L23.6133 21.4807L41.3793 3.7147L38.471 0.806396L20.705 18.5723L2.93907 0.806396Z" fill="#000"/>
                </svg>
                </div>

                <div className={styles.back} onClick={() => onBack()}>
                    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_3087_1005)">
                        <path d="M20.0574 39.6974L21.9261 37.8288L26.3856 33.3692L31.8026 27.9522L36.4596 23.2953C37.2154 22.5394 37.9587 21.7751 38.7271 21.0277L38.7607 20.9941V23.9629L36.8921 22.0943L32.4325 17.6347L27.0155 12.2177L22.3586 7.56079C21.6027 6.80493 20.8385 6.05747 20.091 5.29321L20.0574 5.25962C19.6753 4.87749 19.4443 4.3148 19.4443 3.7731C19.4443 3.25659 19.6711 2.64351 20.0574 2.28657C20.4564 1.92124 20.9813 1.64829 21.5439 1.67349C22.1024 1.69868 22.6273 1.88765 23.0305 2.28657L24.8991 4.15523L29.3587 8.6148L34.7757 14.0318L39.4326 18.6887C40.1885 19.4446 40.9527 20.192 41.7002 20.9563L41.7338 20.9899C42.5358 21.7919 42.5358 23.1567 41.7338 23.9587C41.1081 24.5886 40.4824 25.2101 39.8609 25.8358L35.4014 30.2954L29.9844 35.7124L25.3274 40.3693C24.5716 41.1251 23.8241 41.8894 23.0599 42.6369L23.0263 42.6705C22.6441 43.0526 22.0814 43.2835 21.5397 43.2835C21.0232 43.2835 20.4102 43.0568 20.0532 42.6705C19.6879 42.2715 19.4149 41.7466 19.4401 41.1839C19.4695 40.6254 19.6543 40.1005 20.0574 39.6974Z" fill="black"/>
                        <path d="M40.2557 24.5802H4.42798C3.94507 24.5802 3.45796 24.5844 2.97505 24.5802H2.91206C2.37457 24.5802 1.80767 24.3451 1.42554 23.9672C1.06021 23.6018 0.787258 23.0055 0.812454 22.4806C0.83765 21.9389 1.01402 21.3762 1.42554 20.9941C1.83706 20.6162 2.34097 20.381 2.91206 20.381H38.7398C39.2227 20.381 39.7098 20.3768 40.1927 20.381H40.2557C40.7932 20.381 41.3601 20.6162 41.7422 20.9941C42.1076 21.3594 42.3805 21.9557 42.3553 22.4806C42.3301 23.0223 42.1538 23.585 41.7422 23.9672C41.3265 24.3409 40.8226 24.5802 40.2557 24.5802Z" fill="black"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_3087_1005">
                        <rect width="43" height="43" fill="white" transform="matrix(-1 0 0 1 43.0818 0.980713)"/>
                        </clipPath>
                        </defs>
                    </svg>
                </div>

                <div className={styles.meetings}>
                    <p>صدور چک</p>
                </div>
            </div>
            
            <div className={styles.container}>
                <div className={styles.Cheq}>
                    <div className={styles.lineone}>
                        <div className={styles.nothing}>
                            <div className={styles.makedate}>
                                <p>تاریخ صدور:</p>
                                <p>{formData.cheqDate || ''}</p>
                            </div>
                            <div className={styles.calender}>
                                <img src={calenderIcon} onClick={() => setIsPickerOpen(prev => !prev)} alt=''></img>
                            </div>
                        </div>
                        <div className={styles.cheqprice}>
                            <p>مبلغ:</p>
                            <input type='text' value={formData.cheqprice || ''} onChange={(e) => updateFormData({ cheqprice: e.target.value })} />
                        </div>
                    </div>
                    <ShamsiDatePicker
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        onSelectDate={handleDateSelect}
                        />
                    <div className={styles.linetwo}>
                        <div className={styles.cardnumber}>
                            <p>شماره حساب:</p>
                            <input type='text' value={formData.cardnumber || ''} onChange={(e) => updateFormData({ cardnumber: e.target.value })} />
                        </div>
                        <div className={styles.nothing2}>
                            <div className={styles.cheqserial}>
                                <p>سریال چک:</p>
                                <input type='text' value={formData.cheqserial || ''} onChange={(e) => updateFormData({ cheqserial: e.target.value })} />
                            </div>
                            <div className={styles.cheqselection}>
                                <button>
                                    انتخاب دسته چک جاری
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.linethree}>
                        {/* گیرنده */}
                        <div className={styles.buyer}>
                        <div className={styles.buyerselect}>
                            <input
                                type="radio"
                                id="buyer"
                                className={styles.customradio}
                                name="role"
                                value="buyer"
                                checked={selectedRole === 'buyer'}
                                onChange={() => setSelectedRole('buyer')}
                            />
                            <label htmlFor="buyer">گیرنده</label>
                        </div>
                        <div className={styles.buyername}
                            style={{
                            pointerEvents: selectedRole === 'buyer' ? 'auto' : 'none',
                            opacity: selectedRole === 'buyer' ? 1 : 0.5,
                            }}
                        >
                            <input type='text' placeholder="نام گیرنده"/>
                        </div>
                        </div>
                        {/* فروشنده */}
                        <div className={styles.seller}>
                        <div className={styles.sellerselect}>
                            <input
                                type="radio"
                                id="seller"
                                className={styles.customradio}
                                name="role"
                                value="seller"
                                checked={selectedRole === 'seller'}
                                onChange={() => setSelectedRole('seller')}
                            />
                            <label htmlFor="seller">فروشنده</label>
                        </div>
                        <div className={styles.sellerinfo}
                            style={{
                            pointerEvents: selectedRole === 'seller' ? 'auto' : 'none',
                            opacity: selectedRole === 'seller' ? 1 : 0.5,
                            }}
                        >
                            <input type='text' placeholder='شماره حساب:' />
                            <input type='text' placeholder='به نام:' />
                            <input type='text' placeholder='نام بانک:' />
                            <input type='text' placeholder='نام یا کد شعبه:' />
                        </div>
                        </div>
                    </div>
                </div>


                
            </div>
            
            <div className={styles.buttons}>
                <button className={styles.nextButton}>
                    ثبت چک
                    <svg viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.5255 1.17522L23.6569 3.04387L19.1973 7.50344L13.7803 12.9204L9.12339 17.5774C8.36753 18.3332 7.60327 19.0765 6.85581 19.8449L6.82222 19.8785H9.79107L7.92241 18.0099L3.46284 13.5503L-1.95415 8.13332L-6.61108 3.47639C-7.36694 2.72053 -8.1144 1.95627 -8.87866 1.20881L-8.91225 1.17522C-9.29438 0.793091 -9.85708 0.562134 -10.3988 0.562134C-10.9153 0.562134 -11.5284 0.788891 -11.8853 1.17522C-12.2506 1.57415 -12.5236 2.09904 -12.4984 2.66174C-12.4732 3.22024 -12.2842 3.74514 -11.8853 4.14827L-10.0166 6.01692L-5.55708 10.4765L-0.140088 15.8935L4.51685 20.5504C5.27271 21.3063 6.02017 22.0705 6.78443 22.818L6.81802 22.8516C7.62007 23.6536 8.98482 23.6536 9.78687 22.8516C10.4167 22.2259 11.0382 21.6002 11.6639 20.9787L16.1235 16.5192L21.5405 11.1022L26.1974 6.44524C26.9533 5.68938 27.7175 4.94192 28.465 4.17766L28.4986 4.14407C28.8807 3.76194 29.1117 3.19924 29.1117 2.65754C29.1117 2.14104 28.8849 1.52795 28.4986 1.17102C28.0997 0.805687 27.5748 0.53274 27.0121 0.557936C26.4536 0.58733 25.9287 0.772095 25.5255 1.17522Z" fill="white"/>
                    </svg>
                </button>
            </div>
        </>
    )
}