require 'em-websocket'
require 'json'

client_count = 0
browsers = []

def handle_command(data,command,&block)

  begin
    parsed_data =  JSON.parse(data)

    if parsed_data["command"] == command
      yield parsed_data if block.arity > 0
    end

    puts parsed_data
  rescue
    puts 'JSON malformed:',$1
  end

end


EventMachine.run {

  EventMachine::WebSocket.start(:host => "127.0.0.1", :port => 8080) do |ws|
    ws.onopen do
      client_count = client_count + 1
    end

    ws.onclose do
      client_count = client_count - 1 if client_count > 0
    end

    ws.onmessage do |msg|

      handle_command msg,'get_visitors' do |params|
        ws.send JSON.generate({
          :command=>'visitors',
          :data=>{
            :time=>Time.now.to_i,
            :visitors=>client_count.to_s
          }
        });
      end

      handle_command msg,'set_browser' do |params|

        browsers.push({
          :id=>params["id"],
          :name=>params["browser"],
          :time=>params["time"]
        })

      end

      handle_command msg,'get_browsers' do |params|

        browser_count = browsers.group_by{|browser| browser[:name]}.map{|browser,value| 
          {:browser=>browser,:users=>value.length}
        }

        ws.send JSON.generate({
          :command=>'get_browsers',
          :data=>JSON.generate(browser_count)
        });
      end

      handle_command msg,'byebye' do |params|
        client = params[:id]
        index = browsers.index{|browser| browser["id"] == client}
        browsers.delete_at(index)
      end
    end

  end
}