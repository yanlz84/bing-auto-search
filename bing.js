// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.301
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
var default_search_words = ["以史为鉴 开创未来", "《731》发布郑重声明", "香港悍匪抢65公斤黄金 7人被抓", "一组数据解码国资央企五年发展", "曾用10年退休金补仓的爷叔解套了", "爱尔兰总统暴怒：把以色列赶出联合国", "护网：公安部公布6起行政执法案例", "女子发现自己名下有138辆车", "何雷：解决台湾问题 常规武器就够了", "育儿补贴新规出台", "江西通报酒店国庆从90元涨至1000元", "“中国三农”APP系假冒", "“嘎子哥”出演电影换人重拍", "男子在林中发现“剑阵”", "蔡依林自曝患“蛇缠腰”后才早睡", "“中国最冷小镇”开启8个月供暖季", "“免费拍照”后取照片要20元每张", "西安一商场用小狮子引流引众怒", "58岁女子整容后肿成熊猫", "香港黄金大劫案半亿黄金全数追回", "赵尚志将军牺牲的确切时间确认", "香港10余悍匪抢走65公斤黄金", "全球多地现黄金大盗", "学校回应“把公厕改宿舍让学生住”", "外国女代表被解放军仪仗队帅到了", "香港黄金大劫案有内鬼？警方回应", "绝症女孩请全村看电影嘱托关照父母", "伊朗公布绞死间谍画面", "埃及3000年前的法老金镯丢失", "董军：随时准备挫败任何外部武力干涉", "中方回应“中企停购英伟达相关芯片”", "陈佩斯为《731》包场30场", "弟弟称找哥哥借款8次借条却多出2张", "必胜客橙汁是果粒橙加冰？客服回应", "继粪水泄漏后中国美院水管再爆裂", "曝F4巡演计划暂停", "餐饮商家集体上演“擦边餐”", "《南京照相馆》在日本专场放映", "外国男子街头偶遇小孩哥获零食投喂", "美国爆发“接吻虫病”疫情", "特朗普想要韩国土地 李在明回应", "美方称中国利用柯克遇刺案诋毁美国", "波兰总理：很快将拥有欧洲最大军队", "918各国军官齐聚中国谈和平", "多地干部体验送外卖送快递", "内蒙古都开始穿羽绒服了", "淄博摇旗大爷再次走上街头呐喊", "泰柬边境冲突再起 现场画面曝光", "九一八事变纪念日 董军重磅发声", "美联储降息对我们有啥影响？", "小米SU7出租车司机被同行举报"]

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
