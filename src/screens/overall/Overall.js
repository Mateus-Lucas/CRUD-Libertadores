import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, FlatList, Alert, Image, ImageBackground } from 'react-native';
import { Button, Text, TextInput, FAB, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import fundo from '../../img/fundo.jpg';
import { TextInputMask } from 'react-native-masked-text';
import { Picker } from '@react-native-picker/picker';

export default function Overall() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [posicaoSelecionada, setPosicaoSelecionada] = useState('');
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null);

  const validationSchema = Yup.object().shape({
    velocidade: Yup.number()
      .required('A velocidade é obrigatória')
      .min(50, 'Deve ter no mínimo 50 overall'),
    defesa: Yup.number()
      .required('A defesa é obrigatória')
      .min(50, 'Deve ter no mínimo 50 overall'),
    finalizacao: Yup.number()
      .required('A finalização é obrigatória')
      .min(50, 'Deve ter no mínimo 50 overall'),
    passe: Yup.number()
      .required('O passe é obrigatóriao')
      .min(50, 'Deve ter no mínimo 50 overall'),
    fisico: Yup.number()
      .required('O fisíco é obrigatório')
      .min(50, 'Deve ter no mínimo 50 overall'),
    drible: Yup.number()
      .required('O drible é obrigatório')
      .min(50, 'Deve ter no mínimo 50 overall'),
  });

  useEffect(() => {
    carregarDadosDoArmazenamentoOverall();
    carregarDadosDoArmazenamentoJogadores().then((jogadoresData) => {
      setJogadores(jogadoresData);
    });
  }, []);

  useEffect(() => {
    if (selectedItem) {
      // Preencha os campos do formulário quando um item for selecionado
      setJogadorSelecionado({
        nome: selectedItem.nome,
        equipe: selectedItem.equipe,
        posicao: selectedItem.posicao,
      });
      setEquipeSelecionada(selectedItem.equipe);
      setPosicaoSelecionada(selectedItem.posicao);
    }
  }, [selectedItem]);


  const carregarDadosDoArmazenamentoOverall = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formDataOverall');
      console.log('Valor bruto do AsyncStorage (Overall):', dadosArmazenados);

      if (dadosArmazenados) {
        try {
          const dadosParseados = JSON.parse(dadosArmazenados);
          console.log('Dados parseados do AsyncStorage (Overall):', dadosParseados);

          if (Array.isArray(dadosParseados)) {
            console.log('Dados parseados como array. Adicionando ao estado existente.');
            setData(dadosParseados);
          } else if (typeof dadosParseados === 'object') {
            console.log('Dados parseados como objeto único. Adicionando ao estado existente.');
            setData([dadosParseados]);
          } else {
            console.error('Dados armazenados não são um array ou objeto:', dadosParseados);
          }
        } catch (error) {
          console.error('Erro ao fazer parse dos dados do AsyncStorage (Overall):', error);
        }
      } else {
        console.log('Nenhum dado armazenado encontrado com a chave "formDataOverall".');
      }
    } catch (erro) {
      console.error('Erro ao carregar os dados do AsyncStorage (Overall):', erro);
    }
  };

  const carregarDadosDoArmazenamentoJogadores = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formDataJogadores');
      console.log('Conteúdo do AsyncStorage (formDataJogadores):', dadosArmazenados);

      if (dadosArmazenados) {
        const dadosParseados = JSON.parse(dadosArmazenados);

        if (Array.isArray(dadosParseados)) {
          return dadosParseados; // Retornar os dados parseados
        }
      }
      return []; // Retorna um array vazio se não houver dados
    } catch (erro) {
      console.error('Erro ao carregar os dados do AsyncStorage:', erro);
      return [];
    }
  };

  const adicionarItem = async (item) => {
    try {
      const novoItem = {
        ...item,
        id: `item_${data.length + 1}_${Date.now()}`,
      };

      const idExiste = data.some(itemExistente => itemExistente.id === novoItem.id);

      if (idExiste) {
        console.error('ID duplicado detectado:', novoItem.id);
        Toast.show({
          type: 'error',
          text1: 'Erro ao adicionar o item. ID duplicado detectado.',
        });
        return;
      }

      await AsyncStorage.setItem('formDataOverall', JSON.stringify([...data, novoItem]));
      setData([...data, novoItem]); // Atualiza o estado local após o AsyncStorage ser atualizado

      Toast.show({
        type: 'success',
        text1: 'Overall adicionado com sucesso!',
      });
    } catch (erro) {
      console.error('Erro ao adicionar o item:', erro);
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar o item. Tente novamente.',
      });
    }
  };


  const editarItem = (item) => {
    setModalVisible(true);
    setSelectedItem(item);
    setJogadorSelecionado({
      nome: item.nome,
      equipe: item.equipe,
      posicao: item.posicao,
    });
    setEquipeSelecionada(item.equipe);
    setPosicaoSelecionada(item.posicao);
  };


  const excluirItem = async (item) => {
    Alert.alert(
      'Excluir Item',
      `Deseja realmente excluir ${item.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            const dadosAtualizados = data.filter((i) => i.id !== item.id);
            setData(dadosAtualizados);
            console.log('Dados após exclusão:', dadosAtualizados);
            await AsyncStorage.setItem('formDataOverall', JSON.stringify(dadosAtualizados));
            Toast.show({
              type: 'success',
              text1: 'Overall excluído com sucesso!',
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ModalFormulario = ({ visivel, aoFechar }) => {
    const [valoresFormulario, setValoresFormulario] = useState(selectedItem);

    useEffect(() => {
      if (!visivel) {
        setValoresFormulario(null);
        setSelectedItem(null);
      }
    }, [visivel]);

    const enviar = async (valores, { resetForm }) => {
      try {
        console.log('Valores antes de enviar:', valores);
        const novoItem = {
          ...valores,
          nome: jogadorSelecionado.nome,
          equipe: equipeSelecionada,
          posicao: posicaoSelecionada,
        };

        if (selectedItem) {
          const dadosAtualizados = data.map((item) =>
            item.id === selectedItem.id ? { ...item, ...novoItem } : item
          );
          setData(dadosAtualizados);
          await AsyncStorage.setItem('formDataOverall', JSON.stringify(dadosAtualizados));
        } else {
          adicionarItem({ id: Date.now().toString(), ...novoItem });
        }

        Toast.show({
          type: 'success',
          text1: 'Overall salvo com sucesso!',
        });
        resetForm(); // Reseta os valores do formulário
        aoFechar();
      } catch (erro) {
        console.error('Erro ao salvar os dados:', erro);
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar os dados. Tente novamente.',
        });
      }
    };


    return (
      <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
        <ImageBackground
          source={fundo}
          resizeMode="cover"
          style={{ flex: 1 }}
        >

          <View style={styles.container}>
            <Text style={styles.title}>{selectedItem ? 'Editar Overall' : 'Novo Overall'}</Text>
            <Formik
              initialValues={valoresFormulario || {
                nome: '',
                equipe: '',
                posicao: '',
                velocidade: '',
                finalizacao: '',
                passe: '',
                drible: '',
                defesa: '',
                fisico: ''
              }}
              validationSchema={validationSchema}
              onSubmit={enviar}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>

                  <Picker
                    selectedValue={jogadorSelecionado ? jogadorSelecionado.nome : ''}
                    onValueChange={(nome) => {
                      const jogador = jogadores.find(j => j.nome === nome);
                      console.log('Valor selecionado no Picker:', nome);
                      console.log('Jogador correspondente:', jogador);
                      setJogadorSelecionado(jogador);
                      handleChange('nome')(nome);
                      if (jogador) {
                        handleChange('equipe')(jogador.equipe);
                        setEquipeSelecionada(jogador.equipe);
                        handleChange('posicao')(jogador.posicao);
                        setPosicaoSelecionada(jogador.posicao);
                      }
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione um jogador" value="" />
                    {jogadores.map(jogador => (
                      <Picker.Item key={jogador.id} label={jogador.nome} value={jogador.nome} />
                    ))}
                  </Picker>

                  <TextInput
                    label="Equipe"
                    onChangeText={handleChange('equipe')}
                    onBlur={handleBlur('equipe')}
                    value={equipeSelecionada.toString()}
                    editable={false} // Impede que os usuários alterem manualmente
                    style={styles.input}
                  />

                  <TextInput
                    label="Posição"
                    onChangeText={handleChange('posicao')}
                    onBlur={handleBlur('posicao')}
                    value={posicaoSelecionada.toString()}  // Corrigido para exibir posicaoSelecionada
                    editable={false}
                    style={styles.input}
                  />

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Velocidade"
                        onChangeText={handleChange('velocidade')}
                        onBlur={handleBlur('velocidade')}
                        value={values.velocidade.toString()}
                        error={touched.velocidade && errors.velocidade}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.velocidade && errors.velocidade && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.velocidade}</Text>
                      )}

                    </View>

                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Drible"
                        onChangeText={handleChange('drible')}
                        onBlur={handleBlur('drible')}
                        value={values.drible.toString()}
                        error={touched.drible && errors.drible}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.drible && errors.drible && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.drible}</Text>
                      )}

                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Finalização"
                        onChangeText={handleChange('finalizacao')}
                        onBlur={handleBlur('finalizacao')}
                        value={values.finalizacao.toString()}
                        error={touched.finalizacao && errors.finalizacao}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.finalizacao && errors.finalizacao && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.finalizacao}</Text>
                      )}

                    </View>

                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Defesa"
                        onChangeText={handleChange('defesa')}
                        onBlur={handleBlur('defesa')}
                        value={values.defesa.toString()}
                        error={touched.defesa && errors.defesa}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.defesa && errors.defesa && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.defesa}</Text>
                      )}

                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Passe"
                        onChangeText={handleChange('passe')}
                        onBlur={handleBlur('passe')}
                        value={values.passe.toString()}
                        error={touched.passe && errors.passe}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.passe && errors.passe && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.passe}</Text>
                      )}

                    </View>

                    <View style={styles.inputWrapper}>
                      <TextInput
                        label="Fisíco"
                        onChangeText={handleChange('fisico')}
                        onBlur={handleBlur('fisico')}
                        value={values.fisico.toString()}
                        error={touched.fisico && errors.fisico}
                        keyboardType="numeric"
                        style={styles.input}
                        render={(props) => (
                          <TextInputMask
                            {...props}
                            type={'custom'}
                            options={{
                              mask: '99',
                            }}
                          />
                        )}
                      />

                      {touched.fisico && errors.fisico && (
                        <Text style={{ color: 'red', textAlign: 'center' }}>{errors.fisico}</Text>
                      )}

                    </View>
                  </View>

                  <View style={styles.containerButton}>
                    <Button
                      mode='contained'
                      onPress={aoFechar}
                      style={[styles.button, styles.voltarButton]}
                    >
                      <Icon name="arrow-left" size={20} color="white" />
                      {'  '}Voltar
                    </Button>

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      <Icon name="check" size={20} color="white" />
                      {'  '} {editarItem ? 'Cadastrar Overall' : 'Atualizar Overall'}
                    </Button>
                  </View>

                </View>
              )}
            </Formik>
          </View>
        </ImageBackground>
      </Modal>
    );
  };

  return (
    <ImageBackground
      source={fundo}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.statsContainer}>
                <Paragraph style={styles.playerInfo}>{item.posicao}</Paragraph>
                <Paragraph style={styles.playerInfo}>{item.posicao}</Paragraph>
              </View>
              <Card.Cover
                source={{ uri: 'https://img.freepik.com/vetores-premium/silhueta-negra-de-um-jogador-de-futebol-correndo-com-a-bola_566661-3599.jpg?w=2000' }}
                style={{ height: 220, marginBottom: 3 }}
              />
              <Card.Content>

                <Paragraph style={styles.playerInfo}>{item.equipe}</Paragraph>

                <Divider style={{ height: 5 }} />

                <Title style={{ fontWeight: 'bold' }}>{item.nome}</Title>

                <Divider style={{ height: 5, marginBottom: 10 }} />

                <View style={styles.statsContainer}>
                  <Paragraph style={styles.stat}>{`VEL: ${item.velocidade}`}</Paragraph>
                  <Paragraph style={styles.stat}>{`FIN: ${item.finalizacao}`}</Paragraph>
                </View>

                <Divider style={{ height: 2, marginBottom: 10 }} />

                <View style={styles.statsContainer}>
                  <Paragraph style={styles.stat}>{`PAS: ${item.passe}`}</Paragraph>
                  <Paragraph style={styles.stat}>{`DRI: ${item.drible}`}</Paragraph>
                </View>

                <Divider style={{ height: 2, marginBottom: 10 }} />

                <View style={styles.statsContainer}>
                  <Paragraph style={styles.stat}>{`DEF: ${item.defesa}`}</Paragraph>
                  <Paragraph style={styles.stat}>{`FIS: ${item.fisico}`}</Paragraph>
                </View>

              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button onPress={() => editarItem(item)}>Editar</Button>
                <Button onPress={() => excluirItem(item)}>Excluir</Button>
              </Card.Actions>
            </Card>

          )}
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            setModalVisible(true);
            setSelectedItem(null);
          }}
        />
        <ModalFormulario visivel={modalVisible} aoFechar={() => setModalVisible(false)} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white'
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginBottom: 30
  },
  button: {
    marginTop: 16,
    backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
  },
  voltarButton: {
    backgroundColor: 'red', // Cor vermelha para o botão "Voltar"
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    marginTop: 16,
  },
  closeButton: {
    color: 'blue',
    marginTop: 16,
  },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 4, // Adiciona uma sombra ao card
    backgroundColor: '#ffffff',
    width: 270
  },
  playerInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  picker: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    fontSize: 20
  }
});

