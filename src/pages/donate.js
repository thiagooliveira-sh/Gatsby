import React from 'react'

import Layout from '../components/Layout/'
import SEO from '../components/seo'
import SocialLinks from '../components/SocialLinks'

import { MainContent } from '../styles/base'

const DonatePage = () => (
  <Layout>
    <SEO
      title="Doações"
      description="Saiba como colaborar com o nosso blog."
    />
    <MainContent>
      <h1>Donate</h1>

      <p>
      O Nosso blog surgiu com a necessidade de compartilhar conhecimentos sobre Linux, Ansible, Devops, automações. Meu objetivo aqui é compartilhar 
      conhecimento sobre tecnologia para pessoas que não sabem ler em outro idioma a não ser o português. 
      </p>

      <p>
      Se você gosta do material desenvolvido por nós e acha que o nosso blog contribui de alguma forma com o seu desenvolvimento e agrega conhecimento 
      a nossa profissão, contribua com qualquer valor e ajude a manter o blog no ar.
      </p>

      <h2>Picpay</h2>
      <img src="https://thiagoalexandria.com.br/assets/img/picpay.jpeg" />  

      <h2>Pix</h2>
      <img src="https://thiagoalexandria.com.br/assets/img/pix.jpeg"/>


      <SocialLinks/>
    </MainContent>
  </Layout>
)

export default DonatePage
