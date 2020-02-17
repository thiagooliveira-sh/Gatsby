---
image: /assets/img/wsl.png
title: Configurar o NodeJs no WSL
description: >-
  Um guia para instalação do node.js configurado no subsistema do Windows para
  Linux (WSL).
date: '2020-02-17'
category: windows
background: '#00A82D'
tags:
  - wsl
  - nodejs
  - node
  - windows
  - windows10
---
Existem diversas formas de realizarmos uma instalação do node.js no linux, porém é interessante que utilizemos um gerenciador de versão, dessa forma poderemos atualiza-lo de forma muito mais rápida e prática. Nesse caso será utilizado o indicado pela Microsoft, instalaremos o nvm e a partir dele será feito a instalação.

Primeiramente, certifique de que tenha o ***curl*** instalado na sua distro WSL, feito isso instale o NVM, com o seguinte comando:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
```

Instalado o NVM, será necessário fechar e abrir novamente o seu terminal, para que o mesmo seja atualizado e possamos seguir com a configuração do node.js. Iniciado o terminal, execute o comando abaixo para verificar as versões instaladas

```bash
nvm ls
```

Nesse ponto você pode optar entre a instalação de dois tipos de versões, a versão mais recente ou a versão mais estável, dessa forma os comandos são os listados abaixo respectivamente:

```bash
nvm install node
nvm install --lts
```

Agora você deve ver a versão que acabou de instalar listada utilizando o comando *nvm ls.* Para alterar a versão do node. js que você deseja usar para um projeto, crie um novo diretório, em seguida, digite ***nvm use node*** para alternar para a versão atual ou ***nvm use --lts*** para alternar para a versão LTS.
