// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.365
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["党的二十届四中全会在北京举行", "坐高铁再也不用扛行李了", "中国打响“北京时间”安全保卫战", "十四五时期一组令人振奋的数字", "全球首台、世界最大 大国工程传捷报", "男子买万元超市卡 被民警狂追10分钟", "网警侦破非法售卖艺人个人信息案", "郑丽文称要赴大陆交流：怕就别出来混", "男子立遗嘱将外甥写成外孙 法院回应", "25省份将实现生育津贴直接发至个人", "缅甸清剿电诈园区 查获30套星链设备", "河南濮阳范县发生地震系谣言", "女子帮母亲大扫除扔掉50万黄金首饰", "中方回应澳方称中方军机释放干扰弹", "招聘现场放露骨女主播海报 高校致歉", "河南多地下雪了", "中方奉劝巴拉圭等国家政府认清形势", "中国军港常“空荡荡” 舰艇都去哪了", "毒株与去年不同！流感进入高发季", "宇树科技发布H2仿生人形机器人", "英国奶奶因汶川地震留中国17年", "卢浮宫案发点离《蒙娜丽莎》仅250米", "粮食烘干机卖空了", "澳军机侵闯西沙领空 解放军警告驱离", "陈汉典lulu登记结婚", "中方回应美方提出的三大问题", "黄晓明晒增肥过程 腹肌变大肚腩", "全季酒店花洒疑有粪便？多方回应", "伍佰演唱会惊现“复制粘贴式”粉丝", "国际调解院正式成立", "DeepSeek开源新模型DeepSeek-OCR", "妇联回应“野人小孩”：不存在虐待", "3D还原卢浮宫大劫案", "美军高速旁军演 万斯车队遭弹片击中", "已有18个国家级都市圈 谁缺席了", "A股收评：全市场超4000只个股上涨", "巴方警告印度：核武环境下无战争余地", "教育局回应“老师上课玩手机麻将”", "泽连斯基：准备进行领土谈判", "广西百色多个村屯被洪水浸泡逾20日", "烧饼再次入选世界最好吃50种面包", "郑丽文痛斥民进党丧心病狂", "喷火表演时演员裤子着火 游乐园回应", "加沙母亲痛哭控诉：停火都是假的", "三轮车斗突然落下砸中修车师傅", "女生误卖奶奶藏有13万金首饰旧衣", "中国9月未从美国进口大豆", "全球首个“力位混合控制算法”提出", "DeepSeek新模型 用视觉方式压缩一切", "24岁“轮椅女孩”参加健美比赛夺冠", "盗墓贼伪装“非遗传承人”盗掘文物"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
