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
        Meu nome é Thiago Alexandria, tenho 22 anos e sou de João Pessoa na Paraíba.
        Trabalho atualmente como Analista de Infraestrutura na{' '}
        <a href="https://www.conductor.com.br/" target="_blank" rel="noopener noreferrer">
          Conductor
        </a>
        , tenho bacharel em Ciências da Computação pelo Centro Universitário de 
        João Pessoa e sempre fui apaixonado por tecnologia. Durante minha formação
        me apaixonei pela área de infraestrutura e redes, depois de começar a estagiar me 
        identifiquei com a área de administração de sistemas.
      </p>

      <p>
        Tive a sorte de conseguir meu primeiro estágio como Analista de Suporte e depois disso 
        meu primeiro emprego também nessa área, tendo atribuições de SysAdmin para resolução de
        problemas de níveis 1 e 2. A maior parte do parque de servidores que tive contato são Linux,
        CentOs para ser mais específico, então estou sempre buscando aprender novas tecnologias
        e serviços.
      </p>
      
      <p>
        Também tenho experiencia com a administração de servidores Windows e também sobre os principais
        painéis de hospedagem e revenda de sites tendo acumulado algumas certificações voltadas ao cPanel e Plesk.
        Sempre tive vontade de começar um blog para poder compartilhar parte da minha trajetória dentro do mercado
        de trabalho e também para ter uma forma de documentar todos os meus estudos, podendo consulta-los futuramente
        sem maiores problemas.
      </p>

      <p>
        Para o ano de 2020 tenho como objetivo focar em algumas tecnologias e metodologias DevOps, Ansible, Docket, Terraform
        e Jenkins, além de que pretendo ainda nesse ano finalizar meus estudos para a prova de certificação para Solutions Architect
        da Amazon. Irei compartilhar nesse blog um pouco sobre tudo o que já aprendi e também sobre os meus novos estudos e metas.
      </p>


      <h2>Habilidades</h2>

      <ul>
        <li>Linux</li>
        <li>Windows Server</li>
        <li>Zabbix/Grafana</li>
        <li>Nginx/Apache</li>
        <li>cPanel/Plesk</li>
        <li>IPTables</li>
        <li>Squid</li>
        <li>Samba</li>
        <li>Openvpn</li>
        <li>Bacula</li>
        <li>Bash</li>
        <li>AWS</li>
        <li>O que ainda não sei busco aprender.</li>
      </ul>


    </MainContent>
  </Layout>
)

export default AboutPage
