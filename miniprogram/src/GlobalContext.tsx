import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';

interface GlobalState {
  userInfo: any;
}

const GlobalContext = createContext<{
  state: GlobalState;
  setState: (data: Partial<GlobalState>) => void;
}>({
  state: { userInfo: null},
  setState: () => {}
});

// 自定义 Hook
export const useGlobal = () => useContext(GlobalContext);

// Provider 组件
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从 Storage 恢复状态（可选）
  const [state, setState] = useState<GlobalState>(() => {
    const saved = Taro.getStorageSync('globalState');
    return saved || { userInfo: null};
  });

  // 监听状态变化并持久化（可选）
  useEffect(() => {
    Taro.setStorageSync('globalState', state);
  }, [state]);

  const setGlobalState = (data: Partial<GlobalState>) => {
    setState(prev => ({ ...prev, ...data }));
  };

  return (
    <GlobalContext.Provider value={{ state, setState: setGlobalState }}>
      {children}
    </GlobalContext.Provider>
  );
};
