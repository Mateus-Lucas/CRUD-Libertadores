import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, FlatList, Alert, Image, ImageBackground } from 'react-native';
import { Button, Text, TextInput, FAB, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import fundo from '../../img/fundo.jpg';
import { TextInputMask } from 'react-native-masked-text';

export default function Jogos() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedEquipeA, setSelectedEquipeA] = useState('');
  const [selectedEquipeB, setSelectedEquipeB] = useState('');
  const [equipes, setEquipes] = useState([]);
  const [equipeNomes, setEquipeNomes] = useState([]);

  const validationSchema = Yup.object().shape({
    equipeA: Yup.string().required('A equipe A é obrigatória'),
    equipeB: Yup.string().required('A equipe B é obrigatória'),
    data: Yup.string().required('A data é obrigatória'),
    horario: Yup.string().required('O horário é obrigatório'),
  });

  useEffect(() => {
    const carregarDadosDoArmazenamentEquipes = async () => {
      try {
        const dadosArmazenados = await AsyncStorage.getItem('formData');

        if (dadosArmazenados) {
          const dadosParseados = JSON.parse(dadosArmazenados);

          if (Array.isArray(dadosParseados)) {
            setData(dadosParseados);
          } else if (typeof dadosParseados === 'object') {
            setData([dadosParseados]);
          } else {
            console.error('Dados armazenados não são um array ou objeto:', dadosParseados);
          }
        }

        const equipesArmazenadas = await AsyncStorage.getItem('equipes');
        if (equipesArmazenadas) {
          const equipesParseadas = JSON.parse(equipesArmazenadas);
          setEquipes(equipesParseadas);

          // Extraia os nomes das equipes para popular equipeNomes
          const nomesDasEquipes = equipesParseadas.map(equipe => equipe.nome);
          setEquipeNomes(nomesDasEquipes);
        }
      } catch (erro) {
        console.error('Erro ao carregar os dados do AsyncStorage:', erro);
      }
    };

    carregarDadosDoArmazenamentEquipes();
  }, []);

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

      setData([...data, novoItem]);

      await AsyncStorage.setItem('formData', JSON.stringify([...data, novoItem]));

      Toast.show({
        type: 'success',
        text1: 'Item adicionado com sucesso!',
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
    setSelectedEquipeA(item.equipeA);
    setSelectedEquipeB(item.equipeB);
  };

  const excluirItem = async (item) => {
    Alert.alert(
      'Excluir Item',
      `Deseja realmente excluir o jogo entre ${item.equipeA} e ${item.equipeB}?`,
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
    const [valoresFormulario, setValoresFormulario] = useState(selectedItem);

    useEffect(() => {
      if (!visivel) {
        setValoresFormulario(null);
        setSelectedItem(null);
        setSelectedEquipeA('');
        setSelectedEquipeB('');
      }
    }, [visivel]);

    const enviar = async (valores, { resetForm }) => {
      try {
        if (selectedItem) {
          const dadosAtualizados = data.map((item) =>
            item.id === selectedItem.id ? { ...item, ...valores } : item
          );
          setData(dadosAtualizados);
          await AsyncStorage.setItem('formData', JSON.stringify(dadosAtualizados));
        } else {
          adicionarItem({ id: Date.now().toString(), ...valores });
        }

        Toast.show({
          type: 'success',
          text1: 'Dados salvos com sucesso!',
        });
        resetForm();
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
            <Text style={styles.title}>{selectedItem ? 'Editar Jogo' : 'Novo Jogo'}</Text>
            <Formik
              initialValues={{
                equipeA: selectedEquipeA,
                equipeB: selectedEquipeB,
                data: '',
                horario: '',
              }}
              validationSchema={validationSchema}
              onSubmit={enviar}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <Picker
                    selectedValue={values.equipeA}
                    onValueChange={(itemValue) => handleChange('equipeA')(itemValue)}
                    style={styles.dropdownButton}
                  >
                    <Picker.Item label="Selecione a equipe" value="" />
                    {equipeNomes.map((nomeEquipe, index) => (
                      <Picker.Item key={index} label={nomeEquipe} value={nomeEquipe} />
                    ))}
                  </Picker>
                  {touched.equipeA && errors.equipeA && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.equipeA}</Text>
                  )}

                  <Picker
                    selectedValue={values.equipeB}
                    onValueChange={(itemValue) => handleChange('equipeB')(itemValue)}
                    style={styles.dropdownButton}
                  >
                    <Picker.Item label="Selecione a equipe" value="" />
                    {equipeNomes.map((nomeEquipe, index) => (
                      <Picker.Item key={index} label={nomeEquipe} value={nomeEquipe} />
                    ))}
                  </Picker>
                  {touched.equipeB && errors.equipeB && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.equipeB}</Text>
                  )}

                  <TextInput
                    label="Data"
                    onChangeText={handleChange('data')}
                    onBlur={handleBlur('data')}
                    value={values.data}
                    error={touched.data && errors.data}
                    style={styles.input}
                    render={(props) => (
                      <TextInputMask
                        {...props}
                        type={'datetime'}
                        options={{
                          format: 'DD/MM/YYYY',
                        }}
                      />
                    )}
                  />
                  {touched.data && errors.data && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.data}</Text>
                  )}

                  <TextInput
                    label="Horário"
                    onChangeText={handleChange('horario')}
                    onBlur={handleBlur('horario')}
                    value={values.horario}
                    error={touched.horario && errors.horario}
                    style={styles.input}
                    render={(props) => (
                      <TextInputMask
                        {...props}
                        type={'datetime'}
                        options={{
                          format: 'HH:mm',
                        }}
                      />
                    )}
                  />
                  {touched.horario && errors.horario && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.horario}</Text>
                  )}

                  <Card.Actions style={styles.cardActions}>
                    <Button mode="outlined" onPress={handleSubmit}>
                      {selectedItem ? 'Salvar Alterações' : 'Adicionar Jogo'}
                    </Button>
                  </Card.Actions>
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
        <Image
          style={styles.imagem}
          source={require('../../img/equipes.jpg')}
        />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card key={item.id} style={styles.card}>
              <Card.Title title={`${item.equipeA} vs ${item.equipeB}  `}
                left={(props) => (
                  <Icon name="soccer-ball-o" size={30} color="black" {...props} />
                )}
              />
              <Card.Content>
                <Text>Data: {item.data}</Text>
                <Text>Horário: {item.horario}</Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button mode="outlined" onPress={() => editarItem(item)}>
                  Editar
                </Button>
                <Button mode="outlined" onPress={() => excluirItem(item)}>
                  Excluir
                </Button>
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
  },
  imagem: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
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
    backgroundColor: 'red',
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
  },
  picker: {
    marginVertical: 8,
    fontSize: 16,
    height: 50,
    color: 'black',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingLeft: 8,
    backgroundColor: '#F8F8F8',
  },
  button: {
    marginTop: 16,
  },
  card: {
    marginVertical: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
