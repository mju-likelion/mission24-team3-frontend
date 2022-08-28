import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { ReactComponent as Like } from '../images/like.svg';
import Modal from './Modal';
import Axios from '../lib/axios';
import { TitleAtom } from '../atoms/TitleAtom';
import useToast from '../hook/useToast';

const List = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sort, setSort] = useState('recent');

  const modalClose = () => {
    setModalOpen(!modalOpen);
    fetchList();
  };

  const { name, id } = useRecoilValue(TitleAtom);
  const setTitleState = useSetRecoilState(TitleAtom);
  const [items, setItems] = useState([]);
  const [, addToast] = useToast();

  useEffect(() => {
    const fetch = async () => {
      const resp = await Axios.get('/category');

      const categories = resp.data.categories;
      const subcategories = [];

      for (const category of categories) {
        for (const subcategory of category.downCategories) {
          subcategories.push(subcategory);
        }
      }

      const randIndex = Math.floor(Math.random() * subcategories.length);
      const selectedCategory = subcategories[randIndex];
      const id = selectedCategory._id;
      const name = selectedCategory.categoryName;

      //console.log(selectedCategory);
      setTitleState({ name, id });
    };

    fetch();
  }, []);

  const like = async (itemId) => {
    if (localStorage.getItem('access-token') === '') {
      addToast('로그인 후 이용해주세요!', 2000);
    } else {
      try {
        const token = localStorage.getItem('access-token');
        await Axios.post(
          `/item/${itemId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        fetchList();
      } catch {
        await dislike(itemId);
      }
    }
  };

  const dislike = async (itemId) => {
    const token = localStorage.getItem('access-token');

    try {
      await Axios.delete(`/item/${itemId}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchList();
    } catch {
      //console.log('여기에선 진짜 서버에 문제가 있는거고');
    }
  };

  const fetchList = async () => {
    try {
      const res = await Axios.get(`/item/items/${sort}?categoryId=${id}`);
      setItems(res.data.items);
      //console.log(res.data.items);
    } catch (err) {
      //console.log(err);
    }
  };

  useEffect(() => {
    if (id !== '') {
      fetchList();
    }
  }, [id, sort]);

  return (
    <ListWrapper>
      <Header>
        {name}
        <SortDiv>
          <button onClick={() => setSort('recent')}>최신순</button> |
          <button onClick={() => setSort('like')}>인기순</button>
        </SortDiv>
      </Header>
      <ListBox>
        <ListBoxWrapper>
          {items.map((item, index) => (
            <div key={index}>
              <ListItemBox>
                <ListItem>{item.name}</ListItem>
              </ListItemBox>
              <LikeBox>
                <Like onClick={() => like(item._id)} />
                <LikeNum>{item.likeCount}</LikeNum>
              </LikeBox>
            </div>
          ))}
        </ListBoxWrapper>
        <Button onClick={modalClose}>추가하기</Button>
        {modalOpen && <Modal modalClose={modalClose}></Modal>}
      </ListBox>
    </ListWrapper>
  );
};

const ListWrapper = styled.div`
  margin: 20px auto;
  width: 560px;
  min-height: 774px;
`;

const Header = styled.div`
  display: flex;
  margin-left: 24px;
  height: 74px;
  font-size: 44px;
  justify-content: space-between;
`;

const SortDiv = styled.span`
  height: 30px;
  font-size: 20px;
  margin: 34px 12px 0 0;

  button {
    background: none;
    border: none;
    cursor: pointer;
  }
`;

const ListBox = styled.div`
  height: 630px;
  border-radius: 36px;
  background-color: ${({ theme }) => theme.colors.yellow};
  padding: 70px 0 0 0;
`;

const ListBoxWrapper = styled.div`
  margin: 0 auto;
  height: 506px;
  width: 392px;

  overflow: auto;
  &::-webkit-scrollbar {
    width: 8px; /* 스크롤바의 너비 */
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.primary}; /* 스크롤바의 색상 */
    height: 2%; /* 스크롤바의 길이 */
  }
  &::-webkit-scrollbar-track {
    background: #fff; /* 스크롤바 뒷 배경 색상 */
  }
`;

const ListItemBox = styled.div`
  width: 344px;
  font-size: 24px;
`;

const ListItem = styled.div`
  width: 328px;
  border-bottom: solid 2px #ffe5a4;
  font-size: 24px;
  margin: 34px 0 0 0;
`;

const LikeBox = styled.div`
  width: 16px;
  height: 30px;
  margin: -30px 0 0 370px;
`;

const LikeNum = styled.div`
  font-size: 10px;
`;

const Button = styled.button`
  position: fixed;
  top: 90%;
  right: 32%;
  background: #a2c79a;
  border-radius: 10px;
  border: none;
  padding: 10px;
  color: white;
  z-index: 100;
`;

export default List;
