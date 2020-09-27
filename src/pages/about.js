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
        Olá, tudo bem com você? Espero que sim! Me chamo Thiago Alexandria, tenho 23 anos e sou de João Pessoa, na Paraíba.
        Trabalho atualmente como Analista de Infraestrutura na{' '}
        <a href="https://www.conductor.com.br/" target="_blank" rel="noopener noreferrer">
          Conductor
        </a>
        , tenho bacharel em Ciências da Computação pelo Centro Universitário de 
        João Pessoa e sempre fui apaixonado por tecnologia. Durante minha formação
        me apaixonei pela área de Infraestrutura e Redes, o que me fez aprofundar meus estudos em Administração de Sistemas.
      </p>

      <p>
        Trabalhei como Analista de Suporte durante o estágio e o primeiro emprego, atuando 
        como SysAdmin de níveis 1 e 2. A maior parte do parque de servidores que tive contato 
        era Linux, CentOs para ser mais específico, então estou sempre buscando aprender novas tecnologias e serviços.
      </p>
      
      <p>
        Possuo também experiência com a administração de servidores Windows, bem como sobre os principais
        painéis de hospedagem e revenda de sites. Ademais, possuo certificações voltadas ao cPanel e Plesk.
        Sempre tive vontade de começar um blog para poder compartilhar parte da minha trajetória dentro do mercado
        de trabalho e também para ter uma forma de documentar todos os meus estudos, podendo consulta-los futuramente
        sem maiores problemas.
      </p>

      <p>
        Para o ano de 2020 tenho como objetivo focar em algumas tecnologias e metodologias DevOps como Ansible, Docker, Terraform
        e Kubernetes, além de que pretendo, ainda nesse ano, finalizar meus estudos referente a prova de certificação para Solutions Architect
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

      <h2>Contato</h2>

      <p>
        Você pode entrar em contato comigo através de qualquer uma das minhas
        redes sociais.
      </p>

      <SocialLinks/>
    </MainContent>
  </Layout>
)

export default AboutPage
