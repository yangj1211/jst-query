import React, { createContext, useContext, useState, useCallback } from 'react';

const TagContext = createContext();

export const useTagContext = () => useContext(TagContext);

export const TagProvider = ({ children }) => {
  const [allTags, setAllTags] = useState(['部门', '职级']);

  const updateTags = useCallback((tags) => {
    setAllTags(tags);
  }, []);

  return (
    <TagContext.Provider value={{ allTags, updateTags }}>
      {children}
    </TagContext.Provider>
  );
};

export default TagContext;
