import { createContext, useContext, useState } from 'react';

const NotifContext = createContext();
export const useNotif = () => useContext(NotifContext);

export const NotifProvider = ({ children }) => {

  const [isModalopen, setisModalopen] = useState(false);
  




  return (
    <NotifContext.Provider
      value={{
        isModalopen,setisModalopen
      }}
    >
      {children}
    </NotifContext.Provider>
  );
};
