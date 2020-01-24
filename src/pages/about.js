import React from 'react'

import Layout from '../components/Layout/'
import SEO from '../components/seo'
import SocialLinks from '../components/SocialLinks'

import { MainContent } from '../styles/base'

const AboutPage = () => (
  <Layout>
    <SEO
      title="Sobre mim"
      description="Saiba um pouco mais sobre mim."
    />
    <MainContent>
      <h1>Sobre mim</h1>
      <p>
        Meu nome é Thiago Alexandria, sou de João Pessoa na Paraiba e
        atualmente sou Sysadmin na{' '}
        <a href="https://www.hostdime.com.br" target="_blank" rel="noopener noreferrer">
          HostDime
        </a>
        , tenho bacharel em Ciencias da Computação pelo Centro Universitário de 
        João Pessoa no ano de 2019 e sempre curti tecnologia, durante minha formação
        me apaixonei pela área de infraestrutura, mais especificamente para área
        de sistemas. Tendo sempre utilizar meu conhecimento de formação com desenvolvimento
        para automatização de processos dentro da minha área.
      </p>

      <p>
        O linux esta bastante presente no meu dia a dia, por isso acho que teremos maior parte 
        dos artigos voltado a esse SO, mas ainda esse ano vou estar me preparando para MCSA da Miscrosoft, então pode-se dizer que para os que interessa, teremos um pouco de Windows e meus relatos referente aos estudos.
        Além disso possuo uma certa experiencia em administração
        de servidores voltados a hospedagem e revenda de sites, tendo acumulado algumas certificações voltadas
        as principais plataformas de gerenciamento, como o cPanel e Plesk.  
      </p>
      
      <p>
        Sempre curti compartilhar conhecimento, acho que esse mindset deveria ser global
        para todo profissional de tecnologia, e esse blog não é diferente, pretendo documentar 
        máximo de procedimentos a nível de gerenciamento e voltado ao meu dia a dia para ajudar
        o máximo de pessoas que conseguir.
      </p>



      <h2>Habilidades</h2>

      <ul>
        <li>Linux</li>
        <li>Windows Server</li>
        <li>Monitoramento com Zabbix</li>
        <li>Nginx/Apache</li>
        <li>cPanel/Plesk</li>
        <li>IPTables</li>
        <li>DHCP</li>
        <li>Squid</li>
        <li>Openvpn</li>
        <li>Samba</li>
        <li>DNS</li>
        <li>O que ainda não sei busco aprender.</li>
      </ul>

      <h2>Contato</h2>

      <p>
        Você pode entrar em contato comigo através de qualquer uma das minhas
        redes sociais.
      </p>

      <SocialLinks hideStyle />
    </MainContent>
  </Layout>
)

export default AboutPage
