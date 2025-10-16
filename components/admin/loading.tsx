import { Loader2 } from 'lucide-react'

const IsLoadingPage = ({ string }: { string: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{string}</p>
    </div>
  )
}

IsLoadingPage.displayName = 'IsLoadingPage'

export default IsLoadingPage
