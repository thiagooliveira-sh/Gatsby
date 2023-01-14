import React from "react"
import PropTypes from "prop-types"
import { DiscussionEmbed } from 'disqus-react';

import * as S from "./styled"

const Comments = ({ url, title }) => {
  const completeURL = `https://thiagoalexandria.com.br${url}`

  return (
    <S.CommentsWrapper>
      <S.CommentsTitle>Comentários</S.CommentsTitle>
      <DiscussionEmbed
          shortname='thiagoalexandria'
          config={
              {
                  url: {completeURL},
                  identifier: {completeURL},
                  title: {title},
                  language: 'pt_br' //e.g. for Traditional Chinese (Taiwan)	
              }
          }
      />
    </S.CommentsWrapper>
  )
}

Comments.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default Comments