/**
 * Lei do Inquilinato - Lei 8.245/91.
 *
 * Foco: regras gerais, deveres locador/locatario, despejo e acao de despejo.
 * Inclui alteracoes da Lei 12.112/09 (despejo liminar) e jurisprudencia
 * consolidada do STJ sobre fianca.
 */

import type { LegalProvision } from '../types'

export const INQUILINATO_LAST_UPDATE = '2026-05-03'

export const INQUILINATO: LegalProvision[] = [
  {
    diploma: 'Lei do Inquilinato',
    artigo: '1',
    caput: 'A locacao de imovel urbano regula-se pelo disposto nesta Lei.',
    paragrafos: {
      'unico': 'Continuam regulados pelo Codigo Civil e pelas leis especiais: a) as locacoes: 1. de imoveis de propriedade da Uniao, dos Estados e dos Municipios, de suas autarquias e fundacoes publicas; 2. de vagas autonomas de garagem ou de espacos para estacionamento de veiculos; 3. de espacos destinados a publicidade; 4. em apart-hoteis, hoteis-residencia ou equiparados, assim considerados aqueles que prestam servicos regulares a seus usuarios e como tais sejam autorizados a funcionar; b) o arrendamento mercantil, em qualquer de suas modalidades.',
    },
    temas: ['locacao urbana', 'ambito aplicacao', 'imovel publico'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '2',
    caput: 'Havendo mais de um locador ou mais de um locatario, entende-se que sao solidarios se o contrario nao se estipulou.',
    temas: ['solidariedade', 'corresponsabilidade', 'locacao multiplos'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '3',
    caput: 'O contrato de locacao pode ser ajustado por qualquer prazo, dependendo de venia conjugal, se igual ou superior a dez anos.',
    temas: ['prazo locacao', 'venia conjugal', 'dez anos'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '4',
    caput: 'Durante o prazo estipulado para a duracao do contrato, nao podera o locador reaver o imovel alugado. Com excecao ao que estipula o paragrafo unico do art. 54-A, o locatario, todavia, podera devolve-lo, pagando a multa pactuada, proporcionalmente ao periodo de cumprimento do contrato, ou, na sua falta, a que for judicialmente estipulada.',
    temas: ['devolucao antecipada', 'multa contratual', 'rescisao locatario'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '22',
    caput: 'O locador e obrigado a:',
    incisos: {
      I: 'entregar ao locatario o imovel alugado em estado de servir ao uso a que se destina',
      II: 'garantir, durante o tempo da locacao, o uso pacifico do imovel locado',
      III: 'manter, durante a locacao, a forma e o destino do imovel',
      IV: 'responder pelos vicios ou defeitos anteriores a locacao',
      V: 'fornecer ao locatario, caso este solicite, descricao minuciosa do estado do imovel, quando de sua entrega, com expressa referencia aos eventuais defeitos existentes',
      VI: 'fornecer ao locatario recibo discriminado das importancias por este pagas, vedada a quitacao generica',
      VIII: 'pagar os impostos e taxas, e ainda o premio de seguro complementar contra fogo, que incidam ou venham a incidir sobre o imovel, salvo disposicao expressa em contrario no contrato',
    },
    temas: ['deveres locador', 'entrega imovel', 'vicios redibitorios', 'IPTU'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '23',
    caput: 'O locatario e obrigado a:',
    incisos: {
      I: 'pagar pontualmente o aluguel e os encargos da locacao, legal ou contratualmente exigiveis, no prazo estipulado ou, em sua falta, ate o sexto dia util do mes seguinte ao vencido, no imovel locado, quando outro local nao tiver sido indicado no contrato',
      II: 'servir-se do imovel para o uso convencionado ou presumido, compativel com a natureza deste e com o fim a que se destina, devendo trata-lo com o mesmo cuidado como se fosse seu',
      III: 'restituir o imovel, finda a locacao, no estado em que o recebeu, salvo as deterioracoes decorrentes do seu uso normal',
      IV: 'levar imediatamente ao conhecimento do locador o surgimento de qualquer dano ou defeito cuja reparacao a este incumba, bem como as eventuais turbacoes de terceiros',
      V: 'realizar a imediata reparacao dos danos verificados no imovel, ou nas suas instalacoes, provocadas por si, seus dependentes, familiares, visitantes ou prepostos',
      VIII: 'pagar as despesas de telefone e de consumo de forca, luz e gas, agua e esgoto',
      X: 'cumprir integralmente a convencao de condominio e os regulamentos internos',
    },
    temas: ['deveres locatario', 'pagamento aluguel', 'restituicao imovel', 'reparacao danos'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '47',
    caput: 'Quando ajustada verbalmente ou por escrito e como prazo inferior a trinta meses, findo o prazo estabelecido, a locacao prorroga-se automaticamente, por prazo indeterminado, somente podendo ser retomado o imovel:',
    incisos: {
      II: 'em decorrencia de extincao do contrato de trabalho, se a ocupacao do imovel pelo locatario estiver relacionada com o seu emprego',
      III: 'se for pedido para uso proprio, de seu conjuge ou companheiro, ou para uso residencial de ascendente ou descendente que nao disponha, assim como seu conjuge ou companheiro, de imovel residencial proprio',
      IV: 'se for pedido para demolicao e edificacao licenciada ou para a realizacao de obras aprovadas pelo Poder Publico, que aumentem a area construida, em, no minimo, vinte por cento',
      V: 'se a vigencia ininterrupta da locacao ultrapassar cinco anos',
    },
    temas: ['denuncia vazia', 'retomada imovel', 'uso proprio', 'cinco anos'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '49',
    caput: 'Nas locacoes ajustadas por escrito e por prazo igual ou superior a trinta meses, a resolucao do contrato ocorrera findo o prazo estipulado, independentemente de notificacao ou aviso.',
    paragrafos: {
      'unico': 'Findo o prazo ajustado, se o locatario continuar na posse do imovel alugado por mais de trinta dias sem oposicao do locador, presumir-se-a prorrogada a locacao por prazo indeterminado, mantidas as demais clausulas e condicoes do contrato.',
    },
    temas: ['locacao trinta meses', 'denuncia cheia', 'prorrogacao automatica'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '53',
    caput: 'Nas locacoes de imoveis utilizados por hospitais, unidades sanitarias oficiais, asilos, estabelecimentos de saude e de ensino autorizados e fiscalizados pelo Poder Publico bem como por entidades religiosas devidamente registradas, somente podera ser retomado o imovel:',
    incisos: {
      I: 'nas hipoteses do art. 9o',
      II: 'se o proprietario, promissario comprador ou promissario cessionario, em carater irrevogavel e imitido na posse, com titulo registrado, que haja quitado o preco da promessa ou que, nao o tendo feito, seja autorizado pelo proprietario, pedir o imovel para demolicao, edificacao licenciada ou reforma que venha a resultar em aumento minimo de cinquenta por cento da area util',
    },
    temas: ['locacao especial', 'hospital', 'escola', 'igreja', 'retomada restrita'],
    area: 'civel',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '59',
    caput: 'Com as modificacoes constantes deste capitulo, as acoes de despejo terao o rito ordinario.',
    paragrafos: {
      '§1': 'Concedera-se liminar para desocupacao em quinze dias, independentemente da audiencia da parte contraria e desde que prestada a caucao no valor equivalente a tres meses de aluguel, nas acoes que tiverem por fundamento exclusivo: I - o descumprimento do mutuo acordo; II - o disposto no inciso II do art. 47, havendo prova escrita da rescisao do contrato de trabalho ou sendo ela demonstrada em audiencia previa; III - o termino do prazo da locacao para temporada; IV - a morte do locatario sem deixar sucessor legitimo na locacao; V - a permanencia do sublocatario no imovel; VIII - o descumprimento das obrigacoes contraidas pelo locatario destinadas a viabilizar a recuperacao do imovel; IX - a falta de pagamento de aluguel e acessorios da locacao no vencimento, estando o contrato desprovido de qualquer das garantias previstas no art. 37.',
    },
    temas: ['acao despejo', 'liminar despejo', 'caucao tres alugueis', 'rito'],
    area: 'civel',
    observacoes: 'Lei 12.112/09 ampliou hipoteses de liminar — incluindo IX (falta pagamento sem garantia).',
  },
  {
    diploma: 'Lei do Inquilinato',
    artigo: '62',
    caput: 'Nas acoes de despejo fundadas na falta de pagamento de aluguel e acessorios da locacao, de aluguel provisorio, de diferencas de alugueis, ou somente de quaisquer dos acessorios da locacao, observar-se-a o seguinte:',
    incisos: {
      I: 'o pedido de rescisao da locacao podera ser cumulado com o de cobranca dos alugueis e acessorios da locacao',
      II: 'o locatario e o fiador poderao evitar a rescisao da locacao requerendo, no prazo da contestacao, autorizacao para o pagamento do debito atualizado, independentemente de calculo e mediante deposito judicial',
    },
    temas: ['despejo falta pagamento', 'purgacao mora', 'cumulacao cobranca'],
    area: 'civel',
  },
  // TODO: arts. 5-9 (extincao), 10-19 (sub-rogacao + alienacao), 24-26 (locacao
  // condominio), 39-46 (garantias locaticias — fianca, caucao, seguro), 51-52
  // (acao renovatoria), 75-78 (rito sumario), 79+ (disposicoes penais).
]
