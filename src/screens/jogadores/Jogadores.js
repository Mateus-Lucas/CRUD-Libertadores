import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, ImageBackground, Alert } from 'react-native';
import { Button, Text, TextInput, Card, FAB } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';
import LinearGradient from 'react-native-linear-gradient';

import fundo from '../../img/fundo.jpg'
import { ScrollView } from 'react-native-gesture-handler';

export default function Jogadores() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [selectedEquipe, setSelectedEquipe] = useState('');
  const [equipeNomes, setEquipeNomes] = useState([]);

  const validationSchema = Yup.object().shape({
    nome: Yup.string().required('O nome é obrigatório'),
    posicao: Yup.string().required('A posição é obrigatória'),
    telefone: Yup.string().required('O telefone é obrigatório'),
    idade: Yup.number().min(18, 'Deve ser maior de idade').required('A idade é obrigatória'),
    altura: Yup.number().required('A altura é obrigatória').max(2.20, 'Altura máxima permitida é 2.20'),
    nacionalidade: Yup.string().required('A nacionalidade é obrigatória'),
  });

  useEffect(() => {
    const equipesMock = [
      { id: '1', nome: 'Equipe A' },
      { id: '2', nome: 'Equipe B' },
      // ... outras equipes
    ];

    setEquipes(equipesMock);
    carregarDadosDoArmazenamento();
  }, []);

  const carregarDadosDoArmazenamento = async () => {
    try {
      const dadosArmazenados = await AsyncStorage.getItem('formData');
      console.log('Conteúdo do AsyncStorage (formDataJogadores):', dadosArmazenados);

      if (dadosArmazenados) {
        const dadosParseados = JSON.parse(dadosArmazenados);

        if (Array.isArray(dadosParseados)) {
          const nomesEquipes = dadosParseados.map((item) => item.nome);
          const equipesUnicas = [...new Set(nomesEquipes)];
          console.log('Nomes de equipes:', nomesEquipes);
          setEquipeNomes(equipesUnicas);
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

      setData([...data, novoJogador]);
      await AsyncStorage.setItem('formDataJogadores', JSON.stringify([...data, novoJogador]));

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
            console.log('Dados após exclusão:', dadosAtualizados);
            await AsyncStorage.setItem('formData', JSON.stringify(dadosAtualizados));
            Toast.show({
              type: 'success',
              text1: 'Item excluído com sucesso!',
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ModalFormulario = ({ visivel, aoFechar }) => {
    return (
      <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
        <ImageBackground
          source={fundo}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.container}>
            <Text style={styles.title}>Novo Jogador</Text>
            <Formik
              initialValues={{
                nome: '',
                equipe: '',
                posicao: '',
                telefone: '',
                idade: '',
                altura: '',
                nacionalidade: '',
              }}
              validationSchema={validationSchema}
              onSubmit={(valores) => {
                adicionarJogador({ ...valores, equipe: selectedEquipe });
                aoFechar();
              }}

            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>

                  <TextInput
                    label="Nome"
                    onChangeText={handleChange('nome')}
                    onBlur={handleBlur('nome')}
                    value={values.nome}
                    error={touched.nome && errors.nome}
                    style={styles.input}
                  />

                  {touched.nome && errors.nome && (
                    <Text style={styles.errorMessage}>{errors.nome}</Text>
                  )}

                  <Text style={styles.label}>Equipe</Text>
                  <Picker
                    selectedValue={selectedEquipe}
                    onValueChange={(itemValue) => setSelectedEquipe(itemValue)}
                    style={styles.dropdownButton}
                  >
                    <Picker.Item label="Selecione a equipe" value="Flamengos" />
                    {equipeNomes.map((nomeEquipe, index) => (
                      <Picker.Item key={index} label={nomeEquipe} value={nomeEquipe} />
                    ))}
                  </Picker>

                  <Text style={styles.label}>Posição</Text>
                  <Picker
                    selectedValue={values.posicao}
                    onValueChange={handleChange('posicao')}
                    style={styles.dropdownButton}
                  >
                    <Picker.Item label="Selecione a posição" value="" />
                    <Picker.Item label="Goleiro" value="Goleiro" />
                    <Picker.Item label="Zagueiro" value="Zagueiro" />
                    <Picker.Item label="Meia" value="Meia" />
                    <Picker.Item label="Atacante" value="Atacante" />
                  </Picker>

                  {touched.posicao && errors.posicao && (
                    <Text style={styles.errorMessage}>{errors.posicao}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    label={'Telefone'}
                    placeholder='(99) 99999-9999'
                    value={values.telefone}
                    onChangeText={handleChange('telefone')}
                    onBlur={handleBlur('telefone')}
                    error={touched.telefone && errors.telefone}
                    keyboardType='numeric'
                    render={(props) => (
                      <TextInputMask
                        {...props}
                        type={'cel-phone'}
                        options={{
                          maskType: 'BRL',
                          withDDD: true,
                          dddMask: '(99) ',
                        }}
                      />
                    )}
                  />

                  <TextInput
                    label="Idade"
                    keyboardType="numeric"
                    onChangeText={handleChange('idade')}
                    onBlur={handleBlur('idade')}
                    value={values.idade}
                    error={touched.idade && errors.idade}
                    style={styles.input}
                  />

                  {touched.idade && errors.idade && (
                    <Text style={styles.errorMessage}>{errors.idade}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    label={'Altura'}
                    placeholder='1.80'
                    value={values.altura}
                    onChangeText={handleChange('altura')}
                    onBlur={handleBlur('altura')}
                    error={touched.altura && errors.altura}
                    keyboardType='numeric'
                    render={(props) => (
                      <TextInputMask
                        {...props}
                        type={'custom'}
                        options={{
                          mask: '9.99',
                        }}
                      />
                    )}
                  />


                  {touched.altura && errors.altura && (
                    <Text style={styles.errorMessage}>{errors.altura}</Text>
                  )}

                  <TextInput
                    label="Nacionalidade"
                    onChangeText={handleChange('nacionalidade')}
                    onBlur={handleBlur('nacionalidade')}
                    value={values.nacionalidade}
                    error={touched.nacionalidade && errors.nacionalidade}
                    style={styles.input}
                  />

                  {touched.nacionalidade && errors.nacionalidade && (
                    <Text style={styles.errorMessage}>{errors.nacionalidade}</Text>
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
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      <Icon name="check" size={20} color="white" />
                      {'  '}Cadastrar Jogador
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
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card key={item.id} style={styles.card}>
              <Card.Title title={`${item.nome}  `} />
              <Card.Content>
                <Text>Posição: {item.posicao}</Text>
                <Text>Equipe: {item.equipe}</Text>
                <Text>Telefone: {item.telefone}</Text>
                <Text>Idade: {item.idade}</Text>
                <Text>Altura: {item.altura}</Text>
                <Text>Nacionalidade: {item.nacionalidade}</Text>
              <Card.Actions>
                <Button onPress={() => excluirItem(item)}>
                  <Icon name="trash" size={20} color="red" />
                </Button>
              </Card.Actions>
              </Card.Content>

            </Card>
          )}
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setModalVisible(true)}
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
    backgroundColor: 'linear-gradient(180deg, #FFD700 0%, #000 100%)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white'
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#f4f4f4',
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    color: 'white'
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
