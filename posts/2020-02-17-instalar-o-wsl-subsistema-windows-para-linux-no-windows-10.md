---
image: /assets/img/wsl.png
title: Instalar o WSL (Subsistema Windows para Linux) no Windows 10
description: Instruções de instalação para o Subsistema Windows para Linux no Windows 10.
date: '2020-02-16'
category: win
background: '#00A82D'
tags:
  - wsl
  - windows
  - windows subsystem for linux
  - windowssubsystem
  - ubuntu
  - debian
  - suse
  - windows 10
  - install
---
A Microsoft desenvolveu uma camada de compatibilidade usando bibliotecas do Kernel Windows, sem nenhum código Linux, para reproduzir binários executáveis do Linux nativamente no Windows 10. Vale frisar que não se trata de um emulador ou virtualizador, a interface de kernel do WSL converte as chamadas dos binários Linux em chamadas de sistema do Windows e as executa em velocidade nativa, papel parecido ao que o Wine executa nos sistemas Linux.

A atualização ***[Fall Creators Update](https://en.wikipedia.org/wiki/Windows_10#Version_1709_(Fall_Creators_Update))*** moveu o processo do WSL para a Windows Store disponibilizando diversas outras distribuições além do Ubuntu. 

![Store](/assets/img/store.png)

Antes de instalar distribuições do Linux para WSL, você deve garantir que o recurso opcional "Subsistema Windows para Linux" esteja habilitado, para isso abra o PowerShell como administrador e execute o comando abaixo, observe que talvez seja necessário reiniciar o computador:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

Após habilitar a feature em questão, basta seguir com a instalação através da Windows Store, selecione a distribuição que deseja instalar e após instalado selecionar a opção "Iniciar"

![Ubuntu](/assets/img/ubuntu18lts.PNG)

Assim que iniciado, será solicitado que crie o seu usuário Unix e que aplique uma senha para o mesmo. A Microsoft recentemente liberou uma atualização para quem faz parte do Windows Insider, contendo a atualização para o WSL, a sua versão WSL2. Para fazer o upgrade de versão da sua instancia, verifique se o seu sistema encontra-se com a versão do SO acima do build 18917. Estando de acordo, basta seguir os passos abaixo:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Após executar os comandos, será necessário uma reinicialização. Reiniciado o computador basta seguir com o procedimento de upgrade seguindo a instrução abaixo:

```powershell
wsl --set-version <Distro> 2
wsl --set-default-version 2
```



Pronto, a sua instalação já encontra-se configurada e pronta para uso.
