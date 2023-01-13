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
      Oi! Espero que esteja tudo bem com você também! Meu nome é Thiago Alexandria, tenho 25 anos e sou de João Pessoa, na Paraíba. 
      Atualmente trabalho como Engenheiro DevOps na <a href="https://www.livelo.com.br/" target="_blank" rel="noopener noreferrer"> Livelo </a> e tenho um Bacharelado em Ciências da Computação pelo Centro Universitário de João Pessoa. 
      Eu sempre fui apaixonado por tecnologia e, durante minha formação, descobri que gostava da área de Infraestrutura e Redes. 
      Isso me motivou a me aprofundar em Administração de Sistemas.
      </p>

      <p>
      Durante o meu estágio e primeiro emprego, atuei como Analista de Suporte e SysAdmin de níveis 1 e 2. 
      A maioria dos servidores com os quais trabalhei era Linux, especificamente CentOS. 
      Por isso, estou sempre buscando aprender sobre novas tecnologias e serviços.
      </p>
      
      <p>
      Além de ter experiência em administração de servidores, tenho me especializado em Cloud, 
      aprendendo sobre os principais provedores de nuvem, como AWS, Azure e Oracle Cloud. 
      Sou certificado em todas as certificações de nível associate da AWS e possuo a certificação Azure Fundamentals. 
      Sempre tive  o desejo de iniciar um blog para compartilhar minha jornada no mercado de trabalho e documentar 
      meus estudos para poder consultá-los facilmente no futuro.
      </p>

      <p>
      Para o ano de 2023, meu objetivo é me aprofundar em algumas tecnologias e metodologias DevOps, 
      como Kubernetes, Terraform e Python. Além disso, pretendo finalizar meus estudos para obter a 
      certificação Solutions Architect Professional da Amazon. Eu planejo compartilhar em meu blog o 
      que já aprendi até agora, bem como meus novos estudos e metas.
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
