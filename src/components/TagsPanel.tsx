import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { AppState, useAppDispatch } from '../utils/store';
import { Tag, addTag, removeTag, updateTag, fetchTags } from '../utils/slices/tagsSlice';
import { HiPlus, HiX, HiPencil, HiCheck, HiFilter } from 'react-icons/hi';
import { AnyAction } from '@reduxjs/toolkit';

interface TagsPanelProps {
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onToggleFilter: (active: boolean) => void;
}

const TagsPanelContainer = styled.div`
  padding: 16px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const TagsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TagsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: ${props => props.theme.textColor};
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

interface TagItemProps {
  active?: boolean;
  color?: string;
}

const TagItem = styled.div<TagItemProps>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${props => props.active 
    ? props.theme.primaryColorLight 
    : props.theme.tagBackground};
  color: ${props => props.active 
    ? props.theme.primaryColor 
    : props.theme.tagText};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active 
      ? props.theme.primaryColorLight 
      : props.theme.hoverBackground};
  }
`;

const TagActions = styled.div`
  margin-left: 6px;
  display: flex;
  gap: 4px;
`;

const TagButton = styled.button`
  background: transparent;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: inherit;
  
  &:hover {
    color: ${props => props.theme.primaryColor};
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${props => props.active ? props.theme.primaryColorLight : 'transparent'};
  color: ${props => props.active ? props.theme.primaryColor : props.theme.textColor};
  border: 1px solid ${props => props.active ? props.theme.primaryColor : props.theme.borderColor};
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.primaryColorLight : props.theme.hoverBackground};
  }
`;

const AddTagForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const TagInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.textColor};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.primaryColorDark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabledColor};
    cursor: not-allowed;
  }
`;

const NoTagsMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.textMuted};
  padding: 12px;
`;

const TagsPanel: React.FC<TagsPanelProps> = ({ 
  selectedTags, 
  onTagSelect, 
  onToggleFilter 
}) => {
  const dispatch = useAppDispatch();
  const tags = useSelector((state: AppState) => state.tags.items);
  const tagsStatus = useSelector((state: AppState) => state.tags.status);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  // 加载标签数据
  useEffect(() => {
    if (tagsStatus === 'idle') {
      dispatch(fetchTags() as unknown as AnyAction);
    }
  }, [dispatch, tagsStatus]);
  
  // 添加新标签
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      dispatch(addTag({ name: newTagName.trim() }));
      setNewTagName('');
    }
  };
  
  // 删除标签
  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击标签
    dispatch(removeTag(tagId));
  };
  
  // 开始编辑标签
  const handleStartEdit = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击标签
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };
  
  // 保存编辑的标签
  const handleSaveEdit = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击标签
    if (editingTagName.trim()) {
      dispatch(updateTag({ 
        id: tagId, 
        updates: { name: editingTagName.trim() } 
      }));
    }
    setEditingTagId(null);
    setEditingTagName('');
  };
  
  // 取消编辑
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击标签
    setEditingTagId(null);
    setEditingTagName('');
  };
  
  // 切换筛选状态
  const handleToggleFilter = () => {
    const newFilterState = !isFilterActive;
    setIsFilterActive(newFilterState);
    onToggleFilter(newFilterState);
  };
  
  // 点击标签时进行选择/取消选择
  const handleTagClick = (tagId: string) => {
    onTagSelect(tagId);
  };
  
  return (
    <TagsPanelContainer>
      <TagsHeader>
        <TagsTitle>标签</TagsTitle>
        <FilterButton 
          active={isFilterActive} 
          onClick={handleToggleFilter}
          title={isFilterActive ? "取消筛选" : "按标签筛选"}
        >
          <HiFilter size={16} />
          {isFilterActive ? "取消筛选" : "筛选"}
        </FilterButton>
      </TagsHeader>
      
      {tags.length > 0 ? (
        <TagsList>
          {tags.map((tag: Tag) => (
            <TagItem 
              key={tag.id} 
              active={selectedTags.includes(tag.id)}
              color={tag.color}
              onClick={() => handleTagClick(tag.id)}
            >
              {editingTagId === tag.id ? (
                <>
                  <TagInput 
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <TagActions onClick={(e) => e.stopPropagation()}>
                    <TagButton onClick={(e) => handleSaveEdit(tag.id, e)} title="保存">
                      <HiCheck size={16} />
                    </TagButton>
                    <TagButton onClick={handleCancelEdit} title="取消">
                      <HiX size={16} />
                    </TagButton>
                  </TagActions>
                </>
              ) : (
                <>
                  {tag.name}
                  <TagActions onClick={(e) => e.stopPropagation()}>
                    <TagButton onClick={(e) => handleStartEdit(tag, e)} title="编辑">
                      <HiPencil size={14} />
                    </TagButton>
                    <TagButton onClick={(e) => handleRemoveTag(tag.id, e)} title="删除">
                      <HiX size={14} />
                    </TagButton>
                  </TagActions>
                </>
              )}
            </TagItem>
          ))}
        </TagsList>
      ) : (
        <NoTagsMessage>暂无标签，请添加</NoTagsMessage>
      )}
      
      <AddTagForm onSubmit={handleAddTag}>
        <TagInput 
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="输入新标签名称"
        />
        <AddButton 
          type="submit" 
          disabled={!newTagName.trim()}
          title="添加标签"
        >
          <HiPlus size={16} />
        </AddButton>
      </AddTagForm>
    </TagsPanelContainer>
  );
};

export default TagsPanel; 