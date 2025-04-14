import React, {useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import {useDebounce} from 'react-use'
import {getTrendingMovies, updateSearchCount} from './appwrite.js'


const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET', 
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`

  }
}

const App = () => {
const [SearchTerm, setSearchTerm] = useState("")
const [errorMessage, seterrorMessage] = useState(null)
const [movieList, setmovieList] = useState([])
const [trending, settrending] = useState([])
const [isLoading, setisLoading] = useState(false)
const [debounceSearch, setdebounceSearch] = useState('')
useDebounce(()=>setdebounceSearch(SearchTerm), 500, [SearchTerm])

const fetchMoviews = async(query='') =>{
  setisLoading(true)
  seterrorMessage("")
  try{
    const endpoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

    
    const response  = await fetch(endpoint, API_OPTIONS)
    console.log(response.json())
    // alert(response)
    if(!response.ok){
      throw new Error("Faild to fetch movies");
    }
    const data  = await response.json()

    if(data.Response == "False"){
      seterrorMessage(data.Error || 'Faild to fetch movies')
      setmovieList([])
      return
    }
    setmovieList(data.results || [])

    if (query && data.results.length >  0){
      await updateSearchCount(query, data.results[0])
    }


  }catch(error){
    console.log(`Error fetching movies: ${error}`)
    seterrorMessage(`Error fetching movies: ${response}`)
  }finally{
    setisLoading(false)
  }
}
const loadTrendingMovies = async()=>{
  try {
    const movies = await  getTrendingMovies()
    settrending(movies)
    
  } catch (error) {
    console.log(`Error fetching trending movies: ${error}`)
    
  }
}

useEffect(()=>{
  fetchMoviews(debounceSearch)


}, [debounceSearch])

useEffect(() => {
  loadTrendingMovies()

}, [])


  return (
    <main>
      < div className='pattern' />


      <div className="wrapper">
        <header>
        <img src="./hero-img.png" alt="Hero Banner" />

        <h1>Find <span className='text-gradient'>Movies</span> you'll enjoy without the Hassle</h1>

        <Search SearchTerm={SearchTerm}  setSearchTerm={setSearchTerm}/>

      

        </header>

        {trending.length > 0 && (
          <section className='trending'>
            <h2 className=''>Trending movies </h2>
            <ul>
              {trending.map((movie, index)=>(
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} srcset="" />
                </li>

              ))}
            </ul>

          </section>
        )}
        
      <section className='all-movies'>
        <h2 >All movies</h2>
        {isLoading ?(
          <Spinner />


        ): errorMessage?(
          <p className='text-red-500'> {errorMessage}  </p>
        ): ( <ul>
                {movieList.map((movie) => (
                  <MovieCard key = {movie.id} movie={movie} />

                ))}
           </ul> 
          )}

      </section>
      </div>


    </main>
  )
}

export default App
