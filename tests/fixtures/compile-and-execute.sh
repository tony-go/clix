#!/bin/bash

loc=$(dirname $0)
prog="${loc}/$1"
shift
cc "${prog}.c" -o "${prog}"
exec ${prog} $@