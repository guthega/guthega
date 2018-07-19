#! /usr/bin/env ash

receiverConfig=$(pwd)/conf/receiver.json
sourceConfig=$(pwd)/conf/source.json

while [ $# -gt 0 ]
do
    case "$1" in
        -s | --sourceConfig)
          sourceConfig="$2"
          shift
          ;;
        -r | --receiverConfig)
          receiverConfig="$2"
          shift
          ;;
    esac
    shift
done

module=$(jq '.module' $receiverConfig)
version=$(jq '.version' $receiverConfig)

if [ "${version}" == "" ]; then
  version="latest"
fi

if [ "${NPM_REGISTRY}" == "" ] then
  echo "Installing version ${version} of module ${module} from NPM"
  npm install "${module//\"}@${version//\"}" --production
else
  echo "Installing version ${version} of module ${module} from ${NPM_REGISTRY}"
  npm install "${module//\"}@${version//\"}" --registry=$NPM_REGISTRY --production
fi

if [ $? == 1 ]; then
  echo 'Module installation failed... exiting.'
  exit 1
fi

exec /usr/local/bin/dumb-init node main.js $@
