import React from 'react'

import Layout from '../components/Layout/'
import SEO from '../components/seo'

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
        , tenho bacharel em Ciências da Computação pelo Centro Universitário de 
        João Pessoa no ano de 2019 e sempre curti tecnologia. Durante minha formação
        me apaixonei pela área de infraestrutura, mais especificamente para área
        de administração de sistemas.
      </p>

      <p>
        Por se tratar em administração de sistemas, a maior parte do parque de servidores 
        que tenho vivência são linux, então estou sempre buscando aprender coisas novas 
        referente a serviços e tecnologias. Apesar de estar diretamente ligado a administração 
        de servidoes Linux, CentOs para ser mais específico, sempre tive vontade de aprender 
        mais sobre administração de servidoes Windows, acho que pelo desafio de ser um ambiente 
        menos gerenciável, comparado ao linux.  
      </p>
      <p>
        Então, esse ano decidi estudar algumas ferramentas novas e focar na metodologia Devops além de
        ampliar meu conhecimento sobre Windows Server e vou compartilhar parte do conhecimento que obtiver
        com esses estudos. Além disso, possuo uma certa experiencia em administração de servidores voltados a hospedagem
        e revenda de sites, tendo acumulado algumas certificações voltadas as principais plataformas
        de gerenciamento, como o cPanel e Plesk.  
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

    </MainContent>
  </Layout>
)

export default AboutPage
