"use client"
import {useState} from 'react'
import { Search } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  Input,
} from '@/components/ui'

import styles from './SearchBar.module.scss'

export const SearchBar = () => {
  const [searchValue, setSearchValue] = useState<string>('')

  const [open, setOpen] = useState<boolean>(false)

  return <Dialog open={open}>
    <DialogTrigger>
      <Search />
      <Input defaultValue={searchValue}  onFocus={(e) => {
        setOpen(true)
      }} />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
      </DialogHeader>
      {/* TODO: Додати можливість пошуку товарів */}
    </DialogContent>
  </Dialog>
};
