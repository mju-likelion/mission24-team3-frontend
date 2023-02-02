import React, { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { ReactComponent as Like } from '../images/like.svg';
import { ReactComponent as RedLike } from '../images/redLike.svg';
import { ReactComponent as Report } from '../images/Report.svg';
import Modal from './Modal';
import { TitleAtom } from '../atoms/TitleAtom';

import useCategory from '../hooks/useCategory';
import useList from '../hooks/useList';
import useLike from '../hooks/useLike';
import useDislike from '../hooks/useDislike';
import useReport from '../hooks/useReport';
import { toast } from 'react-toastify';

const List = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sort, setSort] = useState('likeCount');
  const token = localStorage.getItem('accessToken');

  const modalClose = () => {
    if (!token) {
      toast('로그인을 먼저 해 주세요!');
      return;
    }

    setModalOpen(!modalOpen);
    if (!modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const { category, categoryLoading } = useCategory();
  const categories = category?.categories;

  const { name, id } = useRecoilValue(TitleAtom);
  const setTitleState = useSetRecoilState(TitleAtom);

  const { list, listFetch } = useList(sort, id);

  useEffect(() => {
    const fetch = async () => {
      if (!categoryLoading) {
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

        setTitleState({ name, id });
      }
    };
    fetch();
  }, [categoryLoading]);

  useEffect(() => {
    if (id) listFetch();
  }, [id, sort]);

  const postLike = useLike(sort, id);
  const deleteLike = useDislike(sort, id);
  const report = useReport();

  const like = async (itemId) => {
    await postLike.mutateAsync(itemId);
    listFetch();
  };

  const dislike = async (itemId) => {
    await deleteLike.mutateAsync(itemId);
    listFetch();
  };

  const reportPrompt = async (itemId) => {
    if (!confirm('정말 신고하시겠습니까?')) {
      return;
    }

    await report.mutateAsync(itemId);
  };

  return (
    <ListWrapper>
      <Header>
        {name}
        <SortDiv>
          <button onClick={() => setSort('createdAt')}>최신순</button> |
          <button onClick={() => setSort('likeCount')}>인기순</button>
        </SortDiv>
      </Header>
      {categoryLoading ? (
        <LoadingComponent>Loading...</LoadingComponent>
      ) : (
        <ListBox>
          <ListBoxWrapper>
            {list?.items?.map((item, index) => (
              <ListElement key={index}>
                <ListItemBox>
                  <ListItem>{item.name}</ListItem>
                </ListItemBox>
                <LikeBox>
                  {item?.likes ? (
                    <RedLike
                      onClick={() => {
                        dislike(item._id);
                      }}
                    />
                  ) : (
                    <Like
                      onClick={() => {
                        like(item._id);
                      }}
                    />
                  )}
                  <LikeNum>{item.likeCount}</LikeNum>
                </LikeBox>
                <ReportBox
                  onClick={() => {
                    reportPrompt(item._id);
                  }}
                >
                  <Report />
                  <ReportText>신고하기</ReportText>
                </ReportBox>
              </ListElement>
            ))}
          </ListBoxWrapper>
          <ButtonWrapper>
            <Button onClick={modalClose}>추가하기</Button>
          </ButtonWrapper>
          {modalOpen && <Modal sort={sort} modalClose={modalClose} />}
        </ListBox>
      )}
    </ListWrapper>
  );
};

const LoadingComponent = styled.div`
  display: flex;
  justify-content: center;
  font-size: 30px;
  padding-top: 300px;
`;

const ListWrapper = styled.div`
  margin: 5px auto;
  width: 560px;
  min-height: 774px;

  @media screen and (max-width: 599px) and (min-width: 375px) {
    width: 85%;
    min-height: 508px;
    margin: 5% auto 10%;
  }
`;

const Header = styled.div`
  height: 74px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-left: 24px;
  font-size: 44px;

  @media screen and (max-width: 599px) and (min-width: 375px) {
    font-size: 40px;
  }
`;

const SortDiv = styled.span`
  height: 30px;
  font-size: 20px;
  margin: 34px 12px 0 0;
  user-select: none;

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  @media screen and (max-width: 599px) and (min-width: 375px) {
    font-size: 14px;
    margin: 34px 5% 0 0;
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
  height: 520px;
  width: 400px;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 8px; /* 스크롤바의 너비 */
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.primary}; /* 스크롤바의 색상 */
    height: 1%; /* 스크롤바의 길이 */
  }
  &::-webkit-scrollbar-track {
    background: #fff; /* 스크롤바 뒷 배경 색상 */
  }
`;

const ListItemBox = styled.div`
  width: 300px;
  font-size: 24px;

  @media screen and (max-width: 599px) and (min-width: 375px) {
    margin-left: 2%;
  }
`;

const ListItem = styled.div`
  width: 300px;
  border-bottom: solid 2px #ffe5a4;
  font-size: 24px;
  margin: 34px 0 0 0;

  @media screen and (max-width: 599px) and (min-width: 375px) {
    font-size: 22px;
  }
`;

const ListElement = styled.div`
  display: flex;
  flex-direction: row;
`;

const LikeBox = styled.div`
  width: 16px;
  height: 30px;

  margin-left: 16px;
  margin-top: 34px;
`;

const ReportBox = styled.div`
  width: 24px;
  height: 38px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  margin-top: 30px;
  margin-left: 16px;
`;

const ReportText = styled.div`
  width: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;

  font-size: 7px;
`;

const LikeNum = styled.div`
  font-size: 10px;
  text-align: center;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  background: #a2c79a;
  border-radius: 10px;
  border: none;
  padding: 10px;
  color: white;
  z-index: 50;
  margin: 50px 18px 0 0;

  @media screen and (max-width: 599px) and (min-width: 375px) {
    margin: 7% 5% 0 0;
  }
`;

export default List;
