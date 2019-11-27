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
      Comments {
        id
        post_id
        body
        date
      }
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

const UPDATE_COMMENT = gql`
  mutation($commentId: ID!, $commentBody: String!) {
    updateComment(id: $commentId, body: $commentBody) {
      id
      body
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation($commentId: ID!) {
    removeComment(id: $commentId)
  }
`;
function App() {
  const { loading, error, data } = useQuery(POSTS);
  const [updatePost] = useMutation(UPDATE_POST);
  const [removePost] = useMutation(REMOVE_POST);
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  if (loading) {
    return 'loading';
  }
  return (
    <div>
      <p>
        all buttons are <strong>Optimistic operation</strong>, turn on <strong>3G fast</strong>{' '}
        network on Chrome to see the differences
      </p>
      <div>
        <p>
          <strong>posts</strong> json data from <strong>json-graphql-server</strong> ( db.js )
        </p>
        {data.allPosts.map(post => (
          <div style={{ margin: '10px' }}>
            <pre>{JSON.stringify(post, undefined, 2)}</pre>
            <button
              onClick={() => {
                if (post.Comments && post.Comments.length > 0) {
                  updateComment({
                    variables: {
                      commentId: post.Comments[0].id,
                      commentBody: `prada prada update ${Math.random()} `,
                    },
                    optimisticResponse: {
                      __typename: 'Mutation',
                      updateComment: {
                        id: post.Comments[0].id,
                        body: `prada prada Optimistic update... ${Math.random()} `,
                        __typename: 'Comment',
                      },
                    },
                  });
                }
              }}
            >
              Update Comment
            </button>
            <button
              onClick={() => {
                if (post.Comments && post.Comments.length > 0) {
                  deleteComment({
                    variables: {
                      commentId: post.Comments[0].id,
                    },
                    optimisticResponse: {
                      __typename: 'Mutation',
                      optimisticRemoveComment: {
                        id: post.Comments[0].id,
                      },
                    },
                    update: (proxy, { data = {} }) => {
                      console.log('data', data);
                      if (data.optimisticRemoveComment || data.removeComment === true) {
                        const postsData = proxy.readQuery({
                          query: POSTS,
                        });
                        console.log('postsData', postsData);
                        const index = postsData.allPosts.findIndex(p => p.id === post.id);
                        postsData.allPosts[index].Comments.splice(0, 1);
                        console.log(`postsData`, postsData);

                        proxy.writeQuery({
                          query: POSTS,
                          data: postsData,
                        });
                      }
                    },
                  });
                }
              }}
            >
              Delete Comment
            </button>
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
              Update Post Title
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
              Delete Post Title
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
