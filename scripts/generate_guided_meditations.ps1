
Add-Type -AssemblyName System.Speech

$ErrorActionPreference = "Stop"
$outDir = Join-Path (Resolve-Path ".") "storage\audio\guided_raw"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$meditations = @(
  @{ File = "meditacao_zen_manha.raw.wav"; Text = "Bem-vindo a meditacao zen da manha. Sente-se com a coluna confortavel. Inspire devagar pelo nariz. Solte o ar sem pressa. Perceba o corpo acordando. Sinta a luz do dia chegando por dentro. Quando pensamentos surgirem, reconheca e volte para a respiracao. A cada inspiracao, clareza. A cada expiracao, suavidade. Permita que este minuto abra um caminho de presenca para o seu dia." },
  @{ File = "meditacao_enraizamento.raw.wav"; Text = "Esta e uma pratica guiada de enraizamento. Apoie os pes no chao. Imagine raizes suaves descendo da planta dos pes. Inspire estabilidade. Expire tensao. Sinta o peso do corpo sendo recebido pela terra. Nada precisa ser forcado. A cada respiracao, voce chega mais ao momento presente. Repita internamente: eu estou aqui. Eu estou seguro. Eu habito meu corpo com calma." },
  @{ File = "meditacao_silencio.raw.wav"; Text = "Agora, entre no silencio interior. Feche os olhos se for confortavel. Escute os sons ao redor sem precisar nomear nenhum deles. Perceba tambem o espaco entre os sons. Inspire e deixe o corpo amolecer. Expire e solte a necessidade de responder ao mundo. Por alguns instantes, apenas esteja. O silencio nao exige desempenho. Ele acolhe voce exatamente como esta." },
  @{ File = "meditacao_vipassana.raw.wav"; Text = "Nesta meditacao vipassana, observe com gentileza. Note a respiracao como ela e. Nao tente mudar o ritmo. Quando um pensamento aparecer, diga mentalmente: pensando. E volte para a sensacao do ar entrando e saindo. Se surgir emocao, diga: sentindo. E volte. A pratica e simples: perceber, nomear, retornar. Cada retorno fortalece a clareza da mente." },
  @{ File = "meditacao_metta.raw.wav"; Text = "Esta e uma meditacao metta, de compaixao. Leve a atencao ao centro do peito. Inspire suavemente. Ao expirar, diga por dentro: que eu esteja em paz. Que eu esteja protegido. Que eu viva com leveza. Agora imagine essa bondade se expandindo para alguem querido. Que essa pessoa esteja em paz. Por fim, deixe a mesma luz tocar todos os seres, sem esforco, como calor do sol." },
  @{ File = "meditacao_body_scan.raw.wav"; Text = "Comece um body scan profundo. Leve a atencao ao topo da cabeca. Relaxe a testa, os olhos e a mandibula. Desca pelos ombros, bracos e maos. Perceba o peito respirando. Solte o abdomen. Sinta quadris, pernas e pes. Se encontrar tensao, nao lute com ela. Apenas respire perto dela. O corpo entende a linguagem da presenca." },
  @{ File = "meditacao_despertar.raw.wav"; Text = "Esta e a meditacao do despertar. Sinta a respiracao como uma pequena chama tranquila. A cada inspiracao, essa luz cresce. A cada expiracao, ela se espalha pelo corpo. Lembre-se de algo simples pelo qual voce pode agradecer agora. Permita que a gratidao organize o coracao. Despertar nao e pressa. E perceber a vida que ja esta aqui." }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Maria Desktop")
$synth.Rate = -2
$synth.Volume = 92

foreach ($m in $meditations) {
  $path = Join-Path $outDir $m.File
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($m.Text)
  $synth.SetOutputToNull()
  Write-Host "Generated $path"
}
