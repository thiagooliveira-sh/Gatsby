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
          Olá! Espero que você esteja bem! Meu nome é <strong>Thiago Alexandria</strong>, nascido em 1997 e natural de João Pessoa, Paraíba. 
          Sou <strong>Especialista DevOps</strong> na 
          <a href="https://www.livelo.com.br/" target="_blank" rel="noopener noreferrer">Livelo</a> e Bacharel em Ciência da Computação 
          pelo Centro Universitário de João Pessoa. Desde cedo, a tecnologia despertou minha curiosidade e paixão, o que me levou a trilhar um caminho na área de 
          <strong>Infraestrutura e Redes</strong>. Foi nessa jornada que me aprofundei na <strong>Administração de Sistemas</strong>, 
          combinando teoria e prática para enfrentar desafios técnicos complexos.
      </p>
      <p>
          Minha carreira começou como <strong>Analista de Suporte</strong> e <strong>SysAdmin</strong> (níveis 1 e 2), onde gerenciei principalmente servidores Linux, 
          com foco em distribuições como <strong>CentOS</strong>. Essa experiência prática consolidou minha base técnica e me motivou a buscar um aprendizado contínuo em novas tecnologias e ferramentas, 
          sempre com o objetivo de entregar soluções robustas e escaláveis.
      </p>
      <p>
          Atualmente, tenho orgulho de ter contribuído para a <strong>migração e transformação digital da Livelo</strong>, ajudando a mover sua infraestrutura de um datacenter tradicional para a <strong>AWS</strong>. 
          Além disso, implementei automações no processo de criação de novas contas AWS na organização, reduzindo o tempo de <strong>onboarding de novos projetos</strong> de semanas para dias, promovendo agilidade e eficiência.
      </p>
      <p>
          Outro destaque da minha trajetória foi a implementação do <strong>Crossplane</strong> para provisionamento de recursos <strong>cloud-native</strong>, permitindo que desenvolvedores solicitassem recursos pré-estabelecidos diretamente 
          através dos <strong>values dos charts</strong> de suas aplicações. Essa abordagem simplificou o gerenciamento de infraestrutura, trouxe maior autonomia para as equipes de desenvolvimento e alinhou os processos com práticas modernas de DevOps.
      </p>
      <p>
          Além da minha atuação profissional, em 2024 iniciei um projeto pessoal de <strong>capacitação e mentoria de novas pessoas</strong> interessadas em ingressar na área de tecnologia. 
          Através da plataforma <strong>Super Prof</strong>, tenho ajudado profissionais iniciantes a desenvolverem habilidades técnicas e se prepararem para os desafios do mercado. 
          Essa experiência tem sido gratificante, pois une meu desejo de compartilhar conhecimento com a oportunidade de impactar positivamente a carreira de outras pessoas.
      </p>
      <p>
          Em 2025, meu objetivo é me especializar ainda mais em tecnologias como <strong>Kubernetes</strong>, <strong>Terraform</strong> e <strong>Python</strong>, 
          além de conquistar as certificações <strong>AWS Certified DevOps Engineer – Professional</strong> e <strong>Certified Kubernetes Administrator (CKA)</strong>. 
          Também estou empenhado em compartilhar minha jornada e aprendizados no meu blog, tanto como forma de retribuir à comunidade quanto para documentar meu progresso.
      </p>
      <p>
          Além dos meus objetivos profissionais e educacionais, estou empolgado com um novo projeto pessoal para 2025: a criação do meu próprio 
          <strong>home lab</strong>. Nele, pretendo explorar e praticar tecnologias avançadas, como Kubernetes, automações com Ansible, monitoramento e 
          orquestração de infraestrutura. Em breve, compartilharei mais detalhes sobre o hardware escolhido, os componentes que integrarão o laboratório, 
          bem como os tópicos e áreas de estudo que irei focar. Esse projeto será um espaço para experimentação e aprendizado contínuo, 
          alinhado com minha paixão por infraestrutura e inovação tecnológica.
      </p>
      <h2>Habilidades</h2>
      <ul>
          <li>Linux (CentOS, Ubuntu, Amazon Linux)</li>
          <li>Web servers: Nginx e Apache</li>
          <li>Painéis de controle: cPanel e Plesk</li>
          <li>Containerização e Orquestração: Docker e Kubernetes</li>
          <li>Infraestrutura como Código: Terraform, Crossplane, Cloudformation</li>
          <li>Automação: Bash e Python</li>
          <li>Cloud Computing: AWS, Azure e Oracle Cloud</li>
          <li>Monitoramento e Observabilidade: Prometheus, Grafana, Dynatrace</li>
          <li>Metodologias DevOps e boas práticas de CI/CD</li>
          <li>Mentoria e capacitação de novos talentos</li>
      </ul>
      <h2>Contato</h2>
      <p>
          Se quiser bater um papo, trocar ideias ou discutir projetos, fico à disposição! 
          Você pode me encontrar em qualquer uma das minhas redes sociais.
      </p>

      <SocialLinks/>
    </MainContent>
  </Layout>
)

export default AboutPage
