import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, FlatList, Alert, Image, ImageBackground } from 'react-native';
import { Button, Text, TextInput, FAB, Card } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import fundo from '../../img/fundo.jpg'
export default function Jogos() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const validationSchema = Yup.object().shape({
    nome: Yup.string()
      .required('O nome é obrigatório'),
    titulos: Yup.string()
      .required('A quantidade de títulos é obrigatória'),
    jogadores: Yup.number()
      .required('A quantidade de jogadores é obrigatória')
      .max(30, 'Deve ter no máximo 30 jogadores')
      .min(22, 'Deve ter no mínimo 22 jogadores'),
    pais: Yup.string()
      .required('O país é obrigatório'),
  });

  useEffect(() => {
    const carregarDadosDoArmazenamento = async () => {
      try {
        const dadosArmazenados = await AsyncStorage.getItem('formData');
        console.log('Dados brutos do AsyncStorage:', dadosArmazenados);

        if (dadosArmazenados) {
          const dadosParseados = JSON.parse(dadosArmazenados);
          console.log('Dados parseados do AsyncStorage:', dadosParseados);

          if (Array.isArray(dadosParseados)) {
            console.log('Dados parseados como array. Adicionando ao estado existente.');
            setData(dadosParseados);
          } else if (typeof dadosParseados === 'object') {
            console.log('Dados parseados como objeto único. Adicionando ao estado existente.');
            setData([dadosParseados]);
          } else {
            console.error('Dados armazenados não são um array ou objeto:', dadosParseados);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar os dados do AsyncStorage:', erro);
      }
    };

    carregarDadosDoArmazenamento();
  }, []);

  const adicionarItem = async (item) => {
    try {
      const novoItem = {
        ...item,
        id: `item_${data.length + 1}_${Date.now()}`, // Usando um contador para garantir unicidade
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

      setData([...data, novoItem]); // Atualiza o estado local

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
            await AsyncStorage.setItem('equipes', JSON.stringify(dadosAtualizados));
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
            <Text style={styles.title}>{selectedItem ? 'Editar Item' : 'Nova Equipe'}</Text>
            <Formik
              initialValues={valoresFormulario || { nome: '', titulos: '', jogadores: '', pais: '' }}
              validationSchema={validationSchema}
              onSubmit={enviar}
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
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.nome}</Text>
                  )}

                  <TextInput
                    label="Títulos"
                    onChangeText={handleChange('titulos')}
                    onBlur={handleBlur('titulos')}
                    value={values.titulos.toString()}
                    error={touched.titulos && errors.titulos}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  {touched.titulos && errors.titulos && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.titulos}</Text>
                  )}

                  <TextInput
                    label="Jogadores"
                    onChangeText={handleChange('jogadores')}
                    onBlur={handleBlur('jogadores')}
                    value={values.jogadores.toString()}
                    error={touched.jogadores && errors.jogadores}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  {touched.jogadores && errors.jogadores && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.jogadores}</Text>
                  )}

                  <TextInput
                    label="País"
                    onChangeText={handleChange('pais')}
                    onBlur={handleBlur('pais')}
                    value={values.pais.toString()}
                    error={touched.age && errors.pais}
                    style={styles.input}
                  />

                  {touched.pais && errors.pais && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.pais}</Text>
                  )}

                  <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    {selectedItem ? 'Salvar' : 'Cadastrar'}
                  </Button>
                </View>
              )}
            </Formik>

            <TouchableOpacity
              onPress={aoFechar}
              style={{ marginTop: 5 }}
            >
              <Icon name="chevron-left" size={30} color="#000" />
            </TouchableOpacity>
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
              <Card.Title title={`${item.nome}  `}
                left={(props) => (
                  <Icon name="soccer-ball-o" size={30} color="black" {...props} />
                )}
              />
              <Card.Content>
                <Text>Títulos: {item.titulos}</Text>
                <Text>Jogadores: {item.jogadores}</Text>
                <Text>País: {item.pais}</Text>
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
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 16,
  },
  closeButton: {
    color: 'blue',
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
