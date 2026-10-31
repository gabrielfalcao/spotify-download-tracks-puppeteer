#!/usr/bin/env bash

set -umeTE
set +f
set -o pipefail
unset IFS
export IFS=$'\n'

declare -- script_name="$(basename "${BASH_SOURCE[0]}")"
declare -- script_path="$(2>/dev/random 1>/dev/random cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
declare -- this_script_path="${script_path}/${script_name}"

on_exit() {
    set +x
}

on_ctrlc() {
    local -- msg="Aborted with Ctrl-C"
    local -i len=${#msg}
    local -i screen_width=0
    if [[ -v COLUMNS ]]; then
        screen_width=$((COLUMNS))
    else
        local -- stty_info=$(stty -a | grep -E -i columns)
        screen_width=$(echo "${stty_info}" | sed -n -E "s,^.*[;]\s+((\s*columns\s+)([0-9]+)|([0-9]+)(\s+columns\s*))[;],\3\4,gp" | grep -E '^[0-9]+$' | sort -un)
    fi

    1>&2 echo -e "\r$(printf '%*s' ${screen_width} "\r\x1b[1;38;2;253;67;83m${msg}")\x1b[0m"
    exit 130
}
trap on_exit exit
trap on_ctrlc hup
trap on_ctrlc int
trap on_ctrlc bus
trap on_ctrlc segv
trap on_ctrlc sys

declare -a argv=(${@})
declare -i argc=${#argv[@]}

declare -- arg=""
declare -- argument=""
declare -- field=""
declare -- key=""
declare -- line=""
declare -- name=""
declare -- url=""
declare -- param=""
declare -- path=""
declare -- pos=""
declare -- value=""

declare -i code=0
declare -i current=0
declare -i index=0
declare -i skip=0

declare -- filename=""
declare -- filename_extension=""
declare -- filename_base=""
declare -- stderr="logs/chromium.stdout.$(date +%s)"
declare -- stdout="logs/chromium.stdout.$(date +%s)"
declare -- chromium_pid_file="logs/chromium.pid.$(date +%s)"
declare -i chromium_pid=-1
mkdir -p logs

declare -a running_instances=()
declare -a valid_instances=()

if running_instances=($(ps aux | grep -E 'Applications/Chromium/Contents/MacOs/Chromium')); then
    running_instances=()
fi
if valid_instances=($(ps aux | grep -E 'Applications/Chromium/Contents/MacOs/Chromium.*remote-debugging-port=9333')); then
    valid_instances=()
fi

if [ ${#running_instances[@]} -gt 0 ]; then
    if [ ${#valid_instances[@]} -gt 0 ]; then
        1>&2 echo "chromium already running with remote debugging"
        exit 0
    else
        1>&2 echo "chromium running without debugging, kill it first"
        exit 1
    fi
fi
set -x
2>${stderr} 1>${stdout} /Applications/Chromium.app/Contents/MacOS/Chromium --remote-debugging-port=9333 --user-data-dir="$HOME/Library/Application Support/Chromium/" &
chromium_pid=$!
echo "${chromium_pid}" > "${chromium_pid_file}"
disown -a

echo "chromium stderr => ${stderr}"
echo "chromium stdout => ${stdout}"
echo "chromium chromium_pid_file => ${chromium_pid_file}"
