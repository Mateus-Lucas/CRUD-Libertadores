import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { Button, Card, Dialog, FAB, MD3Colors, Portal, Text } from 'react-native-paper'
import Toast from 'react-native-toast-message'

export default function ListaEquipes({ navigation, route }) {

  const [equipes, setEquipes] = useState([])
  const [showModalExcluirUsuario, setShowModalExcluirUsuario] = useState(false)
  const [equipeASerExcluida, setEquipeASerExcluida] = useState(null)

  useEffect(() => {
    loadEquipes()
  }, [])

  async function loadEquipes() {
    const response = await AsyncStorage.getItem('equipes')
    console.log("🚀 ~ file: ListaEquipes.js:21 ~ loadequipes ~ response:", response)
    const equipesStorage = response ? JSON.parse(response) : []
    setEquipes(equipesStorage)
  }

  const showModal = () => setShowModalExcluirUsuario(true);

  const hideModal = () => setShowModalExcluirUsuario(false);

  async function adicionarEquipe(equipe) {
    let novaListaequipes = equipes
    novaListaequipes.push(equipe)
    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaequipes));
    setEquipes(novaListaequipes)
  }

  async function editarEquipe(equipeAntiga, novosDados) {
    console.log('equipe ANTIGA -> ', equipeAntiga)
    console.log('DADOS NOVOS -> ', novosDados)

    const novaListaequipes = equipes.map(equipe => {
      if (equipe == equipeAntiga) {
        return novosDados
      } else {
        return equipe
      }
    })

    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaequipes))
    setEquipes(novaListaequipes)

  }

  async function excluirEquipe(equipe) {
    const novaListaequipes = equipes.filter(p => p !== equipe)
    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaequipes))
    setEquipes(novaListaequipes)
    Toast.show({
      type: 'success',
      text1: 'Equipe excluida com sucesso!'
    })
  }

  function handleExluirEquipe() {
    excluirEquipe(equipeASerExcluida)
    setEquipeASerExcluida(null)
    hideModal()
  }

  return (
    <View style={styles.container}>

      <Image
        source={require('../../img/equipes.jpg')} // Adicione um logotipo da Libertadores ou imagem relevante
        style={styles.logo}
      />

      <Text variant='titleLarge' style={styles.title} >Lista de equipes</Text>

      <FlatList
        style={styles.list}
        data={equipes}
        renderItem={({ item }) => (
          <Card
            mode='outlined'
            style={styles.card}
          >
            <Card.Content
              style={styles.cardContent}
            >
              <View style={{ flex: 1 }}>
                <Text variant='titleMedium'>{item?.nome}</Text>
                <Text variant='bodyLarge'>Nome: {item?.nome}</Text>
                <Text variant='bodyLarge'>País: {item?.pais}</Text>
                <Text variant='bodyLarge'>jogadores: {item.jogadores}</Text>
                <Text variant='bodyLarge'>Títulos: {item.titulos}</Text>
              </View>

            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.push('FormEquipes', { acao: editarEquipe, equipe: item })}>
                Editar
              </Button>
              <Button onPress={() => {
                setEquipeASerExcluida(item)
                showModal()
              }}>
                Excluir
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.push('FormEquipes', { acao: adicionarEquipe })}
      />


      <Portal>
        <Dialog visible={showModalExcluirUsuario} onDismiss={hideModal}>
          <Dialog.Title>Atenção!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Tem certeza que deseja excluir este usuário?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideModal}>Voltar</Button>
            <Button onPress={handleExluirEquipe}>Tenho Certeza</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold',
    margin: 10
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  list: {
    width: '90%',
  },
  card: {
    marginTop: 15
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: MD3Colors.primary80,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 15
  },
  logo: {
    width: 400,
    height: 320,
  },
})