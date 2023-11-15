import axios from 'axios'

const Paises = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/paises/BR|US'
})

export default Paises