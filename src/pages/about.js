import React from 'react'

import Layout from '../components/Layout/'
import Seo from '../components/seo'
import SocialLinks from '../components/SocialLinks'

import { MainContent } from '../styles/base'

const AboutPage = () => (
  <Layout>
    <Seo
      title="Sobre mim"
      description="Saiba um pouco mais sobre mim."
    />
    <MainContent>
      <h1>Sobre mim</h1>
      <p>
      Olá! Espero que você esteja bem! Meu nome é Thiago Alexandria, sou de 1997 e natural de João Pessoa, Paraíba. 
      Atualmente, sou Engenheiro DevOps na <a href="https://www.livelo.com.br/" target="_blank" rel="noopener noreferrer"> Livelo </a> 
      e possuo um diploma de Bacharel em Ciência da Computação pelo Centro Universitário de João Pessoa. 
      Desde sempre, a tecnologia despertou minha paixão e, durante meus estudos, descobri um grande interesse pela área 
      de Infraestrutura e Redes, o que me motivou a me aprofundar na Administração de Sistemas.
      </p>

      <p>
      Ao longo do meu estágio e do meu primeiro emprego, desempenhei funções como Analista de Suporte e SysAdmin de níveis 1 e 2.
      A maioria dos servidores com os quais trabalhei rodava Linux, mais especificamente CentOS. Por esse motivo, estou constantemente 
      buscando aprender sobre novas tecnologias e serviços.
      </p>
      
      <p>
      Além da minha experiência em administração de servidores, tenho me especializado em Cloud Computing, adquirindo conhecimento 
      sobre os principais provedores de nuvem, como AWS, Azure e Oracle Cloud. Sou certificado em todas as certificações de 
      nível associate da AWS e possuo a certificação Azure Fundamentals. 
      Sempre tive o desejo de iniciar um blog para compartilhar minha jornada no mercado de trabalho e documentar meus estudos para fácil consulta no futuro.
      </p>

      <p>
      Para o ano de 2023, tenho como objetivo aprofundar meu conhecimento em algumas tecnologias e metodologias DevOps, como Kubernetes, Terraform e Python. 
      Além disso, pretendo concluir meus estudos para obter a certificação Solutions Architect Professional da Amazon.
      Planejo compartilhar no meu blog o que já aprendi até o momento, bem como minhas novas experiências e metas.
      </p>


      <h2>Habilidades</h2>

      <ul>
        <li>Linux</li>
        <li>Nginx/Apache</li>
        <li>cPanel/Plesk</li>
        <li>Kubernetes</li>
        <li>Bash</li>
        <li>Docker</li>
        <li>Terraform</li>
        <li>AWS</li>
        <li>Estou sempre em busca de aprendizado contínuo.</li>
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
