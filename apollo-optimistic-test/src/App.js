import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const POSTS = gql`
  query {
    allPosts {
      id
      title
    }
  }
`;

const UPDATE_POST = gql`
  mutation($id: ID!, $title: String!) {
    updatePost(id: $id, title: $title) {
      id
      title
    }
  }
`;

const REMOVE_POST = gql`
  mutation($id: ID!) {
    removePost(id: $id)
  }
`;
function App() {
  const { loading, error, data } = useQuery(POSTS);
  const [updatePost] = useMutation(UPDATE_POST);
  const [removePost] = useMutation(REMOVE_POST);

  if (loading) {
    return 'loading';
  }
  return (
    <div className="App">
      <div>
        {data.allPosts.map(post => (
          <div>
            post.id: {post.id}, title {post.title}
            <button
              onClick={() => {
                updatePost({
                  variables: { id: post.id, title: `${Math.random()}` },
                  optimisticResponse: {
                    __typename: 'Mutation',
                    updatePost: {
                      id: post.id,
                      title: 'optimistic update text',
                      __typename: 'Post',
                    },
                  },
                });
              }}
            >
              Update
            </button>
            <button
              onClick={() => {
                removePost({
                  variables: { id: post.id },
                  optimisticResponse: {
                    __typename: 'Mutation',
                    optimisticRemovePost: {
                      id: post.id,
                      title: 'optimistic Delete text',
                      __typename: 'Post',
                    },
                  },
                  update: (proxy, { data = {} }) => {
                    console.log('data', data);
                    if (data.optimisticRemovePost || data.removePost === true) {
                      const postsData = proxy.readQuery({
                        query: POSTS,
                      });
                      console.log('postsData', postsData);
                      const index = postsData.allPosts.findIndex(p => p.id === post.id);
                      postsData.allPosts.splice(index, 1);
                      console.log(`postsData`, postsData);
                      // console.log(
                      //   `postsData.allPosts.filter(p => p.id !== post.id)`,
                      //   postsData.allPosts.filter(p => p.id !== post.id),
                      // );
                      proxy.writeQuery({
                        query: POSTS,
                        data: { ...postsData },
                      });
                    }
                  },
                });
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
