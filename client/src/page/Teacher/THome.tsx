import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText, PlusCircle, RatioIcon, User2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import RecentNotes from './components/RecentNotes'

export default function THome() {
  return (
      <main className='flex-1 p-4 md:p-8'>
        <div className='flex justify-between items-center mb-6'> 
            <div>
                <h1 className='text-2xl font-bold'>Dashboard</h1>
                <p className=''>Welcome to your ClassBuddy dashboard</p>
            </div>

            <Link to={""}>
            <Button>
                <PlusCircle className='h-4 w-4'/>
                Create Notes
            </Button>
            </Link>
        </div>

        {/* Stats */}

        <div className='grid md:grid-cols-3 mb-8 gap-4'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='font-medium text-sm'>Total Notes</CardTitle>
                    <FileText className='w-4 h-4'/>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>10</div>
                    <p className="text-xs text-muted-foreground mt-1">+5 from last month</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='font-medium text-sm'>Total Students</CardTitle>
                    <User2 className='w-4 h-4'/>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>50</div>
                    <p className="text-xs text-muted-foreground mt-1">+5 from last month</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='font-medium text-sm'>Total Quiz</CardTitle>
                    <RatioIcon className='w-4 h-4'/>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>2</div>
                    <p className="text-xs text-muted-foreground mt-1">+5 from last month</p>
                </CardContent>
            </Card>
        </div>

        {/* Recent Articles */}
       {/* <RecentArticle articles={articles} /> */}
       <RecentNotes />
    </main>
  )
}
