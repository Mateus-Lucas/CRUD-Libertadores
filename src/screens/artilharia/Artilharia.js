import React, { useState, useEffect } from 'react';
import { View, FlatList, Modal, StyleSheet, ImageBackground, Alert } from 'react-native';
import { Button, Text, TextInput, Card, FAB } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';

import fundo from '../../img/fundo.jpg';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';

export default function Artilharia() {

  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedEquipe, setSelectedEquipe] = useState('');
  const [equipeNomes, setEquipeNomes] = useState([]);
  const [editPlayerData, setEditPlayerData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null);
  const [jogadores, setJogadores] = useState([]);

  const validationSchema = Yup.object().shape({
    nome: Yup.string().required('O nome é obrigatório'),
    equipe: Yup.string().required('A equipe é obrigatória'),
    gols: Yup.number().required('A quantidade de gols é obrigatória').min(0, 'Deve ser maior ou igual a 0'),
    assistencias: Yup.number().required('A quantidade de assistências é obrigatória').min(0, 'Deve ser maior ou igual a 0'),
  });

  useEffect(() => {
    carregarDadosDoArmazenamentoEquipes();
    carregarDadosDoArmazenamentoJogadores();
    carregarDadosFormJogadores();
  }, []);

  const carregarDadosFormJogadores = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formJogadores');
      console.log('Conteúdo do AsyncStorage (formJogadores):', dadosArmazenados);

      if (dadosArmazenados) {
        const dadosParseados = JSON.parse(dadosArmazenados);

        if (Array.isArray(dadosParseados)) {
          setFormJogadores(dadosParseados);
        }
      }
    } catch (erro) {
      console.error('Erro ao carregar os dados do AsyncStorage (formJogadores):', erro);
    }
  };

  useEffect(() => {
    carregarDadosDoArmazenamentoEquipes();
  }, [modalVisible]);

  const carregarDadosDoArmazenamentoEquipes = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formData');
      console.log('Conteúdo do AsyncStorage (formData):', dadosArmazenados);

      if (dadosArmazenados) {
        const dadosParseados = JSON.parse(dadosArmazenados);
        console.log('Dados parseados:', dadosParseados);

        if (Array.isArray(dadosParseados)) {
          const nomesEquipes = dadosParseados.map((item) => item.nome.trim());
          console.log('Nomes de equipes:', nomesEquipes);

          const equipesUnicas = [...new Set(nomesEquipes)];
          console.log('Equipes únicas:', equipesUnicas);

          setEquipeNomes(equipesUnicas);
        }
      }
    } catch (erro) {
      console.error('Erro ao carregar os dados do AsyncStorage:', erro);
    }
  };

  const carregarDadosDoArmazenamentoJogadores = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formDataJogadores');
      console.log('Conteúdo do AsyncStorage (formData):', dadosArmazenados);

      if (dadosArmazenados) {
        const dadosParseados = JSON.parse(dadosArmazenados);
        console.log('Dados parseados:', dadosParseados);

        if (Array.isArray(dadosParseados)) {
          setJogadores(dadosParseados);  // Atualize jogadores em vez de equipeNomes
        }

      }
    } catch (erro) {
      console.error('Erro ao carregar os dados do AsyncStorage:', erro);
    }
  };

  const adicionarJogador = async (jogador) => {
    try {
      const novoJogador = {
        ...jogador,
        id: `jogador_${data.length + 1}_${Date.now()}`,
      };

      // Atualize o estado 'data' e 'filteredPlayers'
      setData((prevData) => [...prevData, novoJogador]);
      setFilteredPlayers((prevPlayers) => [...prevPlayers, novoJogador]);

      // Atualize o AsyncStorage apenas com o estado 'data'
      await AsyncStorage.setItem('formDataJogadores', JSON.stringify([...data, novoJogador]));

      // Atualize o estado 'equipeNomes' com as equipes únicas da lista de jogadores
      const nomesEquipesAtualizados = [...new Set([...equipeNomes, jogador.equipe])];
      setEquipeNomes(nomesEquipesAtualizados);

      Toast.show({
        type: 'success',
        text1: 'Jogador cadastrado com sucesso!',
      });
    } catch (erro) {
      console.error('Erro ao cadastrar o jogador:', erro);
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar o jogador. Tente novamente.',
      });
    }
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
            setFilteredPlayers(dadosAtualizados);

            // Atualize o estado 'equipeNomes' após a exclusão
            const nomesEquipesAtualizados = dadosAtualizados.map((item) => item.equipe);
            const equipesUnicasAtualizadas = [...new Set(nomesEquipesAtualizados)];
            setEquipeNomes(equipesUnicasAtualizadas);

            await AsyncStorage.setItem('formDataJogadores', JSON.stringify(dadosAtualizados));
            Toast.show({
              type: 'success',
              text1: 'Jogador excluído com sucesso!',
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const editarItem = (item) => {
    setEditPlayerData(item);
    setModalVisible(true);
  };

  const handleUpdatePlayer = async (updatedPlayer) => {
    try {
      const updatedData = data.map((item) =>
        item.id === updatedPlayer.id ? updatedPlayer : item
      );

      setData(updatedData);
      setFilteredPlayers(updatedData); // Adicione esta linha para atualizar filteredPlayers

      await AsyncStorage.setItem('formDataJogadores', JSON.stringify(updatedData));

      Toast.show({
        type: 'success',
        text1: 'Jogador atualizado com sucesso!',
      });
    } catch (erro) {
      console.error('Erro ao atualizar o jogador:', erro);
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar o jogador. Tente novamente.',
      });
    }
  };

  const ModalFormulario = ({ visivel, aoFechar, editPlayerData }) => {
    return (
      <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
        <ImageBackground
          source={fundo}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.container}>
            <Text style={styles.title}>{editPlayerData ? 'Editar Artilheiro' : 'Novo Artilheiro'}</Text>
            <Formik
              initialValues={editPlayerData || {
                nome: '',
                equipe: '',
                gols: '',
                assistencias: ''
              }}
              validationSchema={validationSchema}
              onSubmit={(valores) => {
                if (editPlayerData) {
                  handleUpdatePlayer({ ...valores, equipe: selectedEquipe });
                } else {
                  adicionarJogador({ ...valores, equipe: selectedEquipe });
                }
                aoFechar();
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <Picker
                    selectedValue={jogadorSelecionado ? jogadorSelecionado.nome : ''}
                    onValueChange={(nome) => {
                      const jogador = jogadores.find(j => j.nome === nome);
                      setJogadorSelecionado(jogador);
                      handleChange('nome')(nome);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione um jogador" value="" />
                    {jogadores.map(jogador => (
                      <Picker.Item key={jogador.id} label={jogador.nome} value={jogador.nome} />
                    ))}
                  </Picker>

                  <Picker
                    selectedValue={selectedEquipe}
                    onValueChange={(itemValue) => setSelectedEquipe(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione a equipe" value="" />
                    {equipeNomes.map((nomeEquipe, index) => (
                      <Picker.Item key={index} label={nomeEquipe} value={nomeEquipe} />
                    ))}
                  </Picker>

                  <TextInput
                    label="Gols"
                    onChangeText={handleChange('gols')}
                    onBlur={handleBlur('gols')}
                    value={values.gols}
                    error={touched.gols && errors.gols}
                    style={styles.input}
                  />
                  {touched.gols && errors.gols && (
                    <Text style={styles.errorMessage}>{errors.gols}</Text>
                  )}

                  <TextInput
                    label="Assistências"
                    onChangeText={handleChange('assistencias')}
                    onBlur={handleBlur('assistencias')}
                    value={values.assistencias}
                    error={touched.assistencias && errors.assistencias}
                    style={styles.input}
                  />
                  {touched.assistencias && errors.assistencias && (
                    <Text style={styles.errorMessage}>{errors.assistencias}</Text>
                  )}

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
                      onPress={() => jogadorSelecionado ? handleUpdatePlayer({ ...values, equipe: selectedEquipe }) : adicionarJogador({ ...values, equipe: selectedEquipe })}
                      style={styles.button}
                    >
                      <Icon name="check" size={20} color="white" />
                      {'  '} {jogadorSelecionado ? 'Atualizar Artilheiro' : 'Cadastrar Artilheiro'}
                    </Button>

                  </View>
                </View>
              )}
            </Formik>
          </ScrollView>
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
          data={sortField ? filteredPlayers.sort((a, b) => b[sortField] - a[sortField]) : filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.cell}>{item.nome}</Text>
                <Text style={styles.cell}>{item.equipe}</Text>
              </View>

              <Text style={styles.cell}>{item.gols}</Text>
              <Text style={styles.cell}>{item.assistencias}</Text>

              <View style={styles.actionCell}>
                <Button mode="outlined" onPress={() => editarItem(item)}>
                  Editar
                </Button>
                <Button mode="outlined" onPress={() => excluirItem(item)}>
                  Excluir
                </Button>
              </View>
            </View>
          )}

          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerText}>Nome/Equipe</Text>
              <Text style={styles.headerText}>Gols</Text>
              <Text style={styles.headerText}>Assistências</Text>
              <Text style={styles.headerText}>Ações</Text>
            </View>
          )}
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            setEditPlayerData(null);
            setModalVisible(true);
          }}
        />

        <ModalFormulario
          visivel={modalVisible}
          aoFechar={() => {
            setModalVisible(false);
            setEditPlayerData(null);
          }}
          editPlayerData={editPlayerData}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'linear-gradient(180deg, #FFD700 0%, #000 100%)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
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
    marginTop: 10
  },
  errorMessage: {
    color: 'red',
    marginTop: 5,
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
  card: {
    marginVertical: 8,
    borderRadius: 10, // Adicione bordas arredondadas
    shadowColor: 'black', // Adicione uma sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5, // Adicione uma elevação para dispositivos Android
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white'
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  actionCell: {
    flexDirection: 'column', // Updated to column
  },
  actionText: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 8, // Add some spacing between Editar and Excluir
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },

});

